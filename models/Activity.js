
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['post','follow','like','delete_post','delete_user','other'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who did the action
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // e.g., someone who was followed / deleted
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
