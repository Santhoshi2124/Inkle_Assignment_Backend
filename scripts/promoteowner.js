// scripts/promoteOwner.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db'); // adjust relative path if needed
const User = require('../models/User');

async function run() {
  await connectDB();
  const email = 'owner@example.com'; // change if needed
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    process.exit(1);
  }
  user.role = 'owner';
  await user.save();
  console.log('Promoted to owner:', user._id.toString());
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
