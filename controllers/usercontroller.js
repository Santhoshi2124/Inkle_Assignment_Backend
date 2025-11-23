// controllers/userController.js
const User = require('../models/User');
const Activity = require('../models/Activity');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.deleted) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.name = name || user.name;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.follow = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) return res.status(400).json({ msg: 'Cannot follow yourself' });

    const target = await User.findById(req.params.id);
    if (!target || target.deleted) return res.status(404).json({ msg: 'User not found' });

    // cannot follow if requester blocked target OR target blocked requester
    if (req.user.blockedUsers && req.user.blockedUsers.includes(target._id)) return res.status(403).json({ msg: 'You have blocked this user' });
    if (target.blockedUsers && target.blockedUsers.includes(req.user._id)) return res.status(403).json({ msg: 'You are blocked by this user' });

    // add follower/following
    if (!target.followers.includes(req.user._id)) {
      target.followers.push(req.user._id);
      await target.save();
    }
    const me = await User.findById(req.user._id);
    if (!me.following.includes(target._id)) {
      me.following.push(target._id);
      await me.save();
    }

    await Activity.create({ type: 'follow', actor: req.user._id, targetUser: target._id, message: `${req.user.name} followed ${target.name}` });

    res.json({ msg: 'Followed', targetId: target._id });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ msg: 'User not found' });

    target.followers = target.followers.filter(id => id.toString() !== req.user._id.toString());
    await target.save();

    const me = await User.findById(req.user._id);
    me.following = me.following.filter(id => id.toString() !== target._id.toString());
    await me.save();

    res.json({ msg: 'Unfollowed' });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.block = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ msg: 'User not found' });

    const me = await User.findById(req.user._id);
    if (!me.blockedUsers.includes(target._id)) {
      me.blockedUsers.push(target._id);
      await me.save();
    }

    // Optional: remove follower/following relationships
    me.following = me.following.filter(id => id.toString() !== target._id.toString());
    me.followers = me.followers.filter(id => id.toString() !== target._id.toString());
    await me.save();

    await Activity.create({ type: 'other', actor: req.user._id, targetUser: target._id, message: `${req.user.name} blocked ${target.name}` });

    res.json({ msg: 'User blocked' });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.getFeed = async (req, res) => {
  try {
    // personalized: posts by people you follow + global activities
    // For simplicity return recent posts from following + public activities
    const me = await User.findById(req.user._id);
    const blocked = me.blockedUsers.map(id => id.toString());

    // posts from following (not deleted, not from blocked authors)
    const posts = await require('../models/Post').find({
      author: { $in: me.following, $nin: blocked },
      deleted: false
    }).sort({ createdAt: -1 }).limit(50).populate('author','name');

    // activities global (filter activities that reference blocked actors/targets)
    const ActivityModel = require('../models/Activity');
    let activities = await ActivityModel.find({}).sort({ createdAt: -1 }).limit(50)
      .populate('actor','name role')
      .populate('targetUser','name')
      .populate('post','content author');

    activities = activities.filter(a => {
      if (!a.actor) return true;
      if (blocked.includes(a.actor._id.toString())) return false;
      if (a.targetUser && blocked.includes(a.targetUser._id.toString())) return false;
      return true;
    });

    res.json({ posts, activities });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};
