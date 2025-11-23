// controllers/activityController.js
const Activity = require('../models/Activity');

exports.getGlobal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let q = Activity.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('actor','name role')
      .populate('targetUser','name')
      .populate('post','content');

    const list = await q;
    res.json({ activities: list });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.getUserActivity = async (req, res) => {
  try {
    const list = await Activity.find({ actor: req.params.id }).sort({ createdAt: -1 })
      .populate('actor','name').populate('post','content');
    res.json({ activities: list });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};
