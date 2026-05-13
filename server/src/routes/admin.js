import { safeCustomer } from '../utils/customer.js';

export function registerAdminRoutes(app, deps) {
  const {
    adminOnly,
    cloudinaryReady,
    cloudinaryFolder,
    readDB,
    writeDB,
    uploadImageToCloudinary,
  } = deps;

  app.post('/api/uploads/product-image', adminOnly, async (req, res) => {
    if (!cloudinaryReady) {
      return res.status(503).json({ message: 'Cloudinary is not configured on the server' });
    }

    const image = req.body.image;
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'A valid image file is required' });
    }

    try {
      const uploaded = await uploadImageToCloudinary(image, cloudinaryFolder);
      return res.status(201).json({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      });
    } catch {
      return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
    }
  });

  app.get('/api/customers', adminOnly, async (_, res) => {
    const db = await readDB();
    db.customers = db.customers || [];
    db.wallets = db.wallets || {};

    const orders = db.orders || [];
    const topups = db.walletTopups || [];

    const users = db.customers
      .map((customer) => safeCustomer(customer, Number(db.wallets[customer.id] || 0)))
      .map((customer) => ({
        ...customer,
        ordersCount: orders.filter((order) => order.customerId === customer.id).length,
        topupsCount: topups.filter((topup) => topup.customerId === customer.id).length,
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

  app.get('/api/orders', adminOnly, async (_, res) => {
    const db = await readDB();
    const enriched = db.orders.map((order) => ({
      ...order,
      product: db.products.find((product) => product.id === order.productId),
    }));

    res.json(enriched);
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
}
