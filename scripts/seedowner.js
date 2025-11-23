// scripts/seedOwner.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const run = async () => {
  await connectDB();
  const email = 'owner@example.com';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Owner exists:', exists._id, 'role:', exists.role);
    return process.exit(0);
  }
  const hashed = await bcrypt.hash('OwnerPass123!', 10);
  const user = new User({ name: 'Owner', email, password: hashed, role: 'owner' });
  await user.save();
  console.log('Owner created', user._id);
  process.exit(0);
};

run();
