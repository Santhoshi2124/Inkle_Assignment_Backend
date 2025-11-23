// controllers/adminController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Activity = require('../models/Activity');

exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.role = 'admin';
    await user.save();
    await Activity.create({ type: 'other', actor: req.user._id, targetUser: user._id, message: 'Promoted to admin' });
    res.json({ msg: 'Promoted', user: { id: user._id, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.demoteAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.role = 'user';
    await user.save();
    await Activity.create({ type: 'other', actor: req.user._id, targetUser: user._id, message: 'Demoted to user' });
    res.json({ msg: 'Demoted', user: { id: user._id, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.deleted = true;
    await user.save();

    // soft-delete their posts
    await Post.updateMany({ author: user._id }, { $set: { deleted: true, deletedBy: req.user._id } });

    await Activity.create({ type: 'delete_user', actor: req.user._id, targetUser: user._id, message: `User deleted by ${req.user.role}` });

    res.json({ msg: 'User soft-deleted' });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};
