const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user minimal info to req.user (avoid payload tampering by fetching fresh user)
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.deleted) return res.status(401).json({ msg: 'User not found or deleted' });
    req.user = user; // full user doc without password
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
