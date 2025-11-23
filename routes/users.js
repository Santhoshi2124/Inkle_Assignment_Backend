const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { follow, unfollow, block, getFeed, getProfile, updateMe } = require('../controllers/usercontroller');

router.get('/:id', auth, getProfile);
router.put('/me', auth, updateMe);

router.post('/:id/follow', auth, follow);
router.post('/:id/unfollow', auth, unfollow);
router.post('/:id/block', auth, block);
router.get('/me/feed', auth, getFeed);

module.exports = router;
