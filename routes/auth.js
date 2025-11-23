const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authcontroller');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// public
router.post('/register', register);
router.post('/login', login);

// sample protected route: only admins and owners
router.get('/protected/admin-only', auth, roles('admin','owner'), (req, res) => {
  res.json({ msg: 'Hello admin/owner', user: req.user });
});

// sample owner-only route
router.get('/protected/owner-only', auth, roles('owner'), (req, res) => {
  res.json({ msg: 'Owner access granted' });
});

module.exports = router;
