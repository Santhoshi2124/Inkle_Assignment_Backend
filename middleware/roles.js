// usage: roles('admin'), roles('owner'), roles('admin','owner')
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
    if (allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ msg: 'Forbidden: insufficient permissions' });
  };
};
