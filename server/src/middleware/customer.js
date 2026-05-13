export function createCustomerOnly(readDB) {
  return async function customerOnly(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('customer-')) {
      return res
        .status(401)
        .json({ message: 'يجب تسجيل الدخول أولًا قبل تنفيذ العملية' });
    }

    const customerId = token.replace('customer-', '');
    const db = await readDB();
    const customer = (db.customers || []).find((item) => item.id === customerId);

    if (!customer) {
      return res
        .status(401)
        .json({ message: 'يجب تسجيل الدخول أولًا قبل تنفيذ العملية' });
    }

    req.customer = customer;
    req.db = db;
    next();
  };
}
