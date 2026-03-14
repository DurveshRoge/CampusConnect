'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  adminLogin,
  getCampuses,
  createCampus,
  updateCampus,
  toggleCampusStatus,
  getAllUsers,
  updateUserRole,
  toggleUserSuspend,
  getAnalytics,
} = require('../controllers/admin.controller');

const router = Router();

const guardSuperAdmin = [protect, restrictTo('superAdmin')];

// Public
router.post('/login', adminLogin);

// Campuses
router.get('/campuses', ...guardSuperAdmin, getCampuses);
router.post('/campuses', ...guardSuperAdmin, createCampus);
router.patch('/campuses/:id', ...guardSuperAdmin, updateCampus);
router.patch('/campuses/:id/status', ...guardSuperAdmin, toggleCampusStatus);

// Users
router.get('/users', ...guardSuperAdmin, getAllUsers);
router.patch('/users/:id/role', ...guardSuperAdmin, updateUserRole);
router.patch('/users/:id/suspend', ...guardSuperAdmin, toggleUserSuspend);

// Analytics
router.get('/analytics', ...guardSuperAdmin, getAnalytics);

module.exports = router;
