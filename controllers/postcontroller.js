// controllers/postController.js
const Post = require('../models/Post');
const Activity = require('../models/Activity');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ msg: 'Content required' });

    const post = new Post({ author: req.user._id, content });
    await post.save();

    // create activity
    await Activity.create({ type: 'post', actor: req.user._id, post: post._id, message: `${req.user.name} made a post` });

    res.status(201).json({ post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author','name email');
    if (!post || post.deleted) return res.status(404).json({ msg: 'Post not found' });
    res.json({ post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deleted) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not allowed' });
    post.content = req.body.content || post.content;
    await post.save();
    res.json({ post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    // permission: author OR admin OR owner
    const can = post.author.toString() === req.user._id.toString() || ['admin','owner'].includes(req.user.role);
    if (!can) return res.status(403).json({ msg: 'Not allowed to delete' });

    post.deleted = true;
    post.deletedBy = req.user._id;
    await post.save();

    await Activity.create({ type: 'delete_post', actor: req.user._id, post: post._id, message: `Post deleted by ${req.user.role}` });

    res.json({ msg: 'Post deleted', post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deleted) return res.status(404).json({ msg: 'Post not found' });

    // prevent liking if blocked by author or blocker? We'll disallow if requester blocked the author
    const author = await User.findById(post.author);
    if (req.user.blockedUsers && req.user.blockedUsers.includes(post.author)) {
      return res.status(403).json({ msg: 'You have blocked this user' });
    }

    if (post.likes.includes(req.user._id)) return res.status(400).json({ msg: 'Already liked' });
    post.likes.push(req.user._id);
    await post.save();

    await Activity.create({ type: 'like', actor: req.user._id, post: post._id, message: `${req.user.name} liked a post` });

    res.json({ msg: 'Post liked', post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deleted) return res.status(404).json({ msg: 'Post not found' });
    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    await post.save();
    res.json({ msg: 'Unliked', post });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};
