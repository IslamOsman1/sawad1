import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import { getStorageMeta, readDB, writeDB } from './data/store.js';
import { adminOnly } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sawad.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const CLIENT_URL = process.env.CLIENT_URL || '*';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'sawad/products';

const googleAuthClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

const cloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const allowedOrigins = CLIENT_URL === '*'
  ? '*'
  : CLIENT_URL.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins === '*') {
        return callback(null, true);
      }

      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

function safeCustomer(customer, balance = 0) {
  const { password, ...safe } = customer;
  return { ...safe, balance };
}

async function getCustomerFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('customer-')) return null;

  const customerId = token.replace('customer-', '');
  const db = await readDB();
  const customer = (db.customers || []).find((item) => item.id === customerId);

  return customer ? { customer, db } : null;
}

async function customerOnly(req, res, next) {
  const result = await getCustomerFromRequest(req);
  if (!result) {
    return res
      .status(401)
      .json({ message: 'يجب تسجيل الدخول أولًا قبل تنفيذ العملية' });
  }

  req.customer = result.customer;
  req.db = result.db;
  next();
}

async function uploadImageToCloudinary(dataUri) {
  return cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'image',
  });
}

app.get('/', (_, res) => {
  res.json({ message: 'SAWAD API is running' });
});

app.get('/api/health', async (_, res) => {
  const storage = await getStorageMeta();
  res.json({ status: 'ok', service: 'sawad-api', storage });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({
      token: 'sawad-admin-token',
      user: { name: 'SAWAD Admin', email },
    });
  }

  return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
});

app.post('/api/customers/register', async (req, res) => {
  const db = await readDB();
  db.customers = db.customers || [];

  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'الاسم والإيميل وكلمة المرور مطلوبة' });
  }

  const exists = db.customers.find(
    (customer) => customer.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    return res.status(409).json({ message: 'هذا الإيميل مسجل بالفعل' });
  }

  const customer = {
    id: `c${Date.now()}`,
    name,
    email,
    phone: phone || '',
    password,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  db.customers.unshift(customer);
  await writeDB(db);

  const { password: _password, ...safe } = customer;
  return res.status(201).json({
    token: `customer-${customer.id}`,
    customer: safe,
  });
});

app.post('/api/customers/login', async (req, res) => {
  const db = await readDB();
  db.customers = db.customers || [];

  const { email, password } = req.body;
  const customer = db.customers.find(
    (item) =>
      item.email.toLowerCase() === String(email || '').toLowerCase() &&
      item.password === password
  );

  if (!customer) {
    return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
  }

  const { password: _password, ...safe } = customer;
  return res.json({
    token: `customer-${customer.id}`,
    customer: safe,
  });
});

app.post('/api/customers/google', async (req, res) => {
  if (!GOOGLE_CLIENT_ID || !googleAuthClient) {
    return res
      .status(503)
      .json({ message: 'Google sign-in is not configured on the server' });
  }

  const credential = req.body.credential;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  let payload;
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Invalid Google sign-in token' });
  }

  if (!payload?.email || payload.email_verified === false) {
    return res
      .status(400)
      .json({ message: 'A verified Google email is required' });
  }

  const db = await readDB();
  db.customers = db.customers || [];

  const email = payload.email;
  let customer = db.customers.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!customer) {
    customer = {
      id: `c${Date.now()}`,
      name: payload.name || 'Google User',
      email,
      phone: '',
      avatar: payload.picture || '',
      googleId: payload.sub || '',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    db.customers.unshift(customer);
  } else {
    customer.avatar = payload.picture || customer.avatar || '';
    customer.googleId = payload.sub || customer.googleId || '';
    if (!customer.name && payload.name) customer.name = payload.name;
    if (!customer.provider) customer.provider = 'google';
  }

  await writeDB(db);

  const { password: _password, ...safe } = customer;
  return res.json({
    token: `customer-${customer.id}`,
    customer: safe,
  });
});

app.post('/api/uploads/product-image', adminOnly, async (req, res) => {
  if (!cloudinaryReady) {
    return res
      .status(503)
      .json({ message: 'Cloudinary is not configured on the server' });
  }

  const image = req.body.image;
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ message: 'A valid image file is required' });
  }

  try {
    const uploaded = await uploadImageToCloudinary(image);
    return res.status(201).json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
  } catch {
    return res
      .status(500)
      .json({ message: 'Failed to upload image to Cloudinary' });
  }
});

app.get('/api/customers', adminOnly, async (_, res) => {
  const db = await readDB();
  db.customers = db.customers || [];
  db.wallets = db.wallets || {};

  const orders = db.orders || [];
  const topups = db.walletTopups || [];

  const users = db.customers
    .map((customer) =>
      safeCustomer(customer, Number(db.wallets[customer.id] || 0))
    )
    .map((customer) => ({
      ...customer,
      ordersCount: orders.filter((order) => order.customerId === customer.id)
        .length,
      topupsCount: topups.filter((topup) => topup.customerId === customer.id)
        .length,
    }));

  res.json(users);
});

app.put('/api/customers/:id/wallet', adminOnly, async (req, res) => {
  const db = await readDB();
  db.wallets = db.wallets || {};

  const customer = (db.customers || []).find((item) => item.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'المستخدم غير موجود' });
  }

  const amount = Number(req.body.amount || 0);
  const mode = req.body.mode || 'set';

  db.wallets[customer.id] =
    mode === 'add'
      ? Number(db.wallets[customer.id] || 0) + amount
      : amount;

  await writeDB(db);
  res.json(safeCustomer(customer, db.wallets[customer.id]));
});

app.get('/api/wallet/me', customerOnly, async (req, res) => {
  const db = await readDB();
  db.wallets = db.wallets || {};

  const balance = Number(db.wallets[req.customer.id] || 0);
  res.json({
    customer: safeCustomer(req.customer, balance),
    balance,
  });
});

app.get('/api/my-orders', customerOnly, async (req, res) => {
  const db = await readDB();
  const orders = (db.orders || [])
    .filter((order) => order.customerId === req.customer.id)
    .map((order) => ({
      ...order,
      product: db.products.find((product) => product.id === order.productId),
    }));

  res.json(orders);
});

app.get('/api/products', async (req, res) => {
  const db = await readDB();
  const { category, q } = req.query;

  let products = db.products.filter(
    (product) => product.status === 'active' || req.query.admin === 'true'
  );

  if (category && category !== 'all') {
    products = products.filter((product) => product.category === category);
  }

  if (q) {
    products = products.filter((product) =>
      `${product.title} ${product.game} ${product.amount}`
        .toLowerCase()
        .includes(String(q).toLowerCase())
    );
  }

  res.json(products);
});

app.post('/api/products', adminOnly, async (req, res) => {
  const db = await readDB();
  const product = {
    id: uuid(),
    status: 'active',
    featured: false,
    ...req.body,
  };

  db.products.unshift(product);
  await writeDB(db);
  res.status(201).json(product);
});

app.put('/api/products/:id', adminOnly, async (req, res) => {
  const db = await readDB();
  db.products = db.products.map((product) =>
    product.id === req.params.id ? { ...product, ...req.body } : product
  );

  await writeDB(db);
  res.json(db.products.find((product) => product.id === req.params.id));
});

app.delete('/api/products/:id', adminOnly, async (req, res) => {
  const db = await readDB();
  db.products = db.products.filter((product) => product.id !== req.params.id);
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/orders', adminOnly, async (_, res) => {
  const db = await readDB();
  const enriched = db.orders.map((order) => ({
    ...order,
    product: db.products.find((product) => product.id === order.productId),
  }));

  res.json(enriched);
});

app.post('/api/orders', customerOnly, async (req, res) => {
  const db = await readDB();
  const customer = req.customer;
  db.products = db.products || [];
  db.orders = db.orders || [];
  db.wallets = db.wallets || {};

  const product = db.products.find((item) => item.id === req.body.productId);
  if (!product) {
    return res.status(404).json({ message: 'المنتج المطلوب غير موجود' });
  }

  const paymentMethod = req.body.payment || 'Wallet';
  const walletBalance = Number(db.wallets[customer.id] || 0);

  if (paymentMethod === 'Wallet' && walletBalance < Number(product.price || 0)) {
    return res.status(400).json({
      message: 'رصيد المحفظة غير كافٍ، يجب إضافة رصيد في المحفظة أولًا قبل إتمام الطلب',
      code: 'INSUFFICIENT_WALLET_BALANCE',
      walletBalance,
      requiredAmount: Number(product.price || 0),
    });
  }

  if (paymentMethod === 'Wallet') {
    db.wallets[customer.id] = walletBalance - Number(product.price || 0);
  }

  const order = {
    id: `o${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    productId: req.body.productId,
    playerId: req.body.playerId,
    payment: paymentMethod,
    customerId: customer.id,
    customer: customer.name,
    email: customer.email,
    phone: customer.phone || req.body.phone || '',
    total: Number(product.price || 0),
  };

  db.orders.unshift(order);
  await writeDB(db);
  res.status(201).json(order);
});

app.put('/api/orders/:id', adminOnly, async (req, res) => {
  const db = await readDB();
  db.orders = db.orders.map((order) =>
    order.id === req.params.id ? { ...order, ...req.body } : order
  );

  await writeDB(db);
  res.json(db.orders.find((order) => order.id === req.params.id));
});

app.get('/api/wallets', adminOnly, async (_, res) => {
  const db = await readDB();
  res.json(db.wallets || {});
});

app.get('/api/wallets/:phone', adminOnly, async (req, res) => {
  const db = await readDB();
  const wallets = db.wallets || {};
  res.json({ phone: req.params.phone, balance: wallets[req.params.phone] || 0 });
});

app.get('/api/wallet-topups', adminOnly, async (_, res) => {
  const db = await readDB();
  res.json(db.walletTopups || []);
});

app.post('/api/wallet-topups', customerOnly, async (req, res) => {
  const db = await readDB();
  db.walletTopups = db.walletTopups || [];

  const customer = req.customer;
  const topup = {
    id: `w${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    customerId: customer.id,
    customer: customer.name,
    email: customer.email,
    phone: customer.phone || req.body.phone || '',
    amount: Number(req.body.amount || 0),
    method: req.body.method,
    receipt: req.body.receipt || '',
  };

  db.walletTopups.unshift(topup);
  await writeDB(db);
  res.status(201).json(topup);
});

app.put('/api/wallet-topups/:id', adminOnly, async (req, res) => {
  const db = await readDB();
  db.walletTopups = db.walletTopups || [];
  db.wallets = db.wallets || {};

  const current = db.walletTopups.find((item) => item.id === req.params.id);
  if (!current) {
    return res.status(404).json({ message: 'طلب المحفظة غير موجود' });
  }

  if (req.body.status === 'approved' && current.status !== 'approved') {
    const creditAmount = Number(req.body.creditAmount || current.amount || 0);
    const walletKey = current.customerId || current.phone;
    db.wallets[walletKey] = Number(db.wallets[walletKey] || 0) + creditAmount;
    current.creditAmount = creditAmount;
    current.approvedAt = new Date().toISOString();
  }

  Object.assign(current, {
    status: req.body.status || current.status,
  });

  await writeDB(db);
  res.json(current);
});

app.get('/api/settings', async (_, res) => {
  const db = await readDB();
  res.json(db.settings);
});

app.put('/api/settings', adminOnly, async (req, res) => {
  const db = await readDB();
  db.settings = { ...db.settings, ...req.body };
  await writeDB(db);
  res.json(db.settings);
});

app.get('/api/stats', adminOnly, async (_, res) => {
  const db = await readDB();
  const revenue = db.orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => {
      const product = db.products.find((item) => item.id === order.productId);
      return sum + (product?.price || 0);
    }, 0);

  res.json({
    products: db.products.length,
    customers: (db.customers || []).length,
    orders: db.orders.length,
    pending: db.orders.filter((order) => order.status === 'pending').length,
    revenue,
    walletPending: (db.walletTopups || []).filter(
      (topup) => topup.status === 'pending'
    ).length,
  });
});

app.listen(PORT, HOST, async () => {
  const storage = await getStorageMeta().catch(() => ({ driver: 'unknown' }));
  console.log(`SAWAD API running on ${HOST}:${PORT}`);
  console.log(`Storage driver: ${storage.driver}`);
});
