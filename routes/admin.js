// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { promoteToAdmin, demoteAdmin, deleteUser } = require('../controllers/admincontroller');

router.post('/promote/:id', auth, roles('owner'), promoteToAdmin);
router.post('/demote/:id', auth, roles('owner'), demoteAdmin);
router.delete('/users/:id', auth, roles('admin','owner'), deleteUser);

module.exports = router;
