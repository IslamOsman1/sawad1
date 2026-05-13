import { safeCustomer } from '../utils/customer.js';

export function registerCustomerRoutes(app, deps) {
  const { readDB, writeDB, customerOnly } = deps;

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
}
