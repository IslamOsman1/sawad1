import { v4 as uuid } from 'uuid';

export function registerAuthRoutes(app, deps) {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    GOOGLE_CLIENT_ID,
    googleAuthClient,
    readDB,
    writeDB,
  } = deps;

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
      return res.status(400).json({ message: 'A verified Google email is required' });
    }

    const db = await readDB();
    db.customers = db.customers || [];

    const email = payload.email;
    let customer = db.customers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!customer) {
      customer = {
        id: `c${Date.now()}-${uuid().slice(0, 6)}`,
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
}
