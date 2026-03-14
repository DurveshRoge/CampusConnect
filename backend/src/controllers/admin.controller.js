'use strict';

const User = require('../models/User');
const College = require('../models/College');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Workspace = require('../models/Workspace');
const { generateToken } = require('../utils/jwt');

// ─── Admin Login ─────────────────────────────────────────────────────────────

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'superAdmin') {
      return res.status(401).json({ success: false, message: 'Invalid credentials or insufficient privileges.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or insufficient privileges.' });
    }

    const token = generateToken(user._id.toString());
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Campus Management ────────────────────────────────────────────────────────

async function getCampuses(req, res, next) {
  try {
    const campuses = await College.find().populate('adminUser', 'name email').sort({ createdAt: -1 });

    // Attach per-campus stats
    const stats = await Promise.all(
      campuses.map(async (campus) => {
        const [students, resources, teams, events] = await Promise.all([
          User.countDocuments({ collegeId: campus._id, role: { $in: ['student', 'committee'] } }),
          Resource.countDocuments({ collegeId: campus._id }),
          Workspace.countDocuments({ collegeId: campus._id }),
          Event.countDocuments({ collegeId: campus._id }),
        ]);
        return {
          ...campus.toJSON(),
          stats: { students, resources, teams, events },
        };
      })
    );

    res.status(200).json({ success: true, data: { campuses: stats } });
  } catch (error) {
    next(error);
  }
}

async function createCampus(req, res, next) {
  try {
    const { name, domain, city, location } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ success: false, message: 'Name and domain are required.' });
    }

    const existing = await College.findOne({ domain: domain.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A campus with this domain already exists.' });
    }

    const campus = await College.create({ name, domain: domain.toLowerCase(), city, location });

    res.status(201).json({ success: true, message: 'Campus created successfully.', data: { campus } });
  } catch (error) {
    next(error);
  }
}

async function updateCampus(req, res, next) {
  try {
    const { id } = req.params;
    const { name, city, location } = req.body;

    const campus = await College.findByIdAndUpdate(
      id,
      { name, city, location },
      { new: true, runValidators: true }
    );

    if (!campus) {
      return res.status(404).json({ success: false, message: 'Campus not found.' });
    }

    res.status(200).json({ success: true, message: 'Campus updated.', data: { campus } });
  } catch (error) {
    next(error);
  }
}

async function toggleCampusStatus(req, res, next) {
  try {
    const campus = await College.findById(req.params.id);
    if (!campus) {
      return res.status(404).json({ success: false, message: 'Campus not found.' });
    }

    campus.isActive = !campus.isActive;
    await campus.save();

    res.status(200).json({
      success: true,
      message: `Campus ${campus.isActive ? 'activated' : 'deactivated'}.`,
      data: { campus },
    });
  } catch (error) {
    next(error);
  }
}

// ─── User Management ──────────────────────────────────────────────────────────

async function getAllUsers(req, res, next) {
  try {
    const { campusId, role, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (campusId) filter.collegeId = campusId;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resumeData')
        .populate('collegeId', 'name domain')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowed = ['student', 'committee', 'campusAdmin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowed.join(', ')}.` });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).populate('collegeId', 'name domain');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User role updated.', data: { user } });
  } catch (error) {
    next(error);
  }
}

async function toggleUserSuspend(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'superAdmin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend a super admin.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Platform Analytics ───────────────────────────────────────────────────────

async function getAnalytics(req, res, next) {
  try {
    const [
      totalCampuses,
      activeCampuses,
      totalUsers,
      suspendedUsers,
      totalResources,
      totalEvents,
      totalTeams,
    ] = await Promise.all([
      College.countDocuments(),
      College.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: { $in: ['student', 'committee', 'campusAdmin'] } }),
      User.countDocuments({ isSuspended: true }),
      Resource.countDocuments(),
      Event.countDocuments(),
      Workspace.countDocuments(),
    ]);

    // Top 5 campuses by user count
    const topCampuses = await User.aggregate([
      { $match: { role: { $in: ['student', 'committee'] } } },
      { $group: { _id: '$collegeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'colleges',
          localField: '_id',
          foreignField: '_id',
          as: 'college',
        },
      },
      { $unwind: '$college' },
      { $project: { name: '$college.name', domain: '$college.domain', count: 1 } },
    ]);

    // Monthly signups for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: { $in: ['student', 'committee'] } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCampuses,
          activeCampuses,
          totalUsers,
          suspendedUsers,
          totalResources,
          totalEvents,
          totalTeams,
        },
        topCampuses,
        monthlySignups,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  adminLogin,
  getCampuses,
  createCampus,
  updateCampus,
  toggleCampusStatus,
  getAllUsers,
  updateUserRole,
  toggleUserSuspend,
  getAnalytics,
};
