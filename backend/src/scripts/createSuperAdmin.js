/**
 * Run this script once to create the initial super admin account.
 *
 * Usage:
 *   cd e:/CampusConnect/backend
 *   node src/scripts/createSuperAdmin.js
 *
 * Set credentials via env vars or edit the defaults below.
 */
'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@campusconnect.io';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log(`Super admin already exists: ${SUPER_ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  // collegeId is not required for superAdmin (model uses conditional required)
  const admin = new User({
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    role: 'superAdmin',
    // no collegeId — allowed for superAdmin
  });

  await admin.save();

  console.log('✅ Super admin created successfully!');
  console.log(`   Email   : ${SUPER_ADMIN_EMAIL}`);
  console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log('   Login at: /admin/login');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to create super admin:', err.message);
  process.exit(1);
});
