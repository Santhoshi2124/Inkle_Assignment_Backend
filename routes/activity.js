// routes/activity.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getGlobal, getUserActivity } = require('../controllers/activitycontroller');

router.get('/global', auth, getGlobal);
router.get('/user/:id', auth, getUserActivity);

module.exports = router;
