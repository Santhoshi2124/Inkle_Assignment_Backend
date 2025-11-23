// routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPost, getPost, updatePost, deletePost, likePost, unlikePost } = require('../controllers/postcontroller');

router.post('/', auth, createPost);
router.get('/:id', auth, getPost); // protected so we can apply blocks
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likePost);
router.post('/:id/unlike', auth, unlikePost);

module.exports = router;
