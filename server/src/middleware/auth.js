export function adminOnly(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== 'sawad-admin-token') {
    return res.status(401).json({ message: 'غير مصرح بالدخول' });
  }
  next();
}
