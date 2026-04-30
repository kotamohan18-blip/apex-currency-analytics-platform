const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Allocation = require('../models/Allocation');
const Internship = require('../models/Internship');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication error' });
  }
};

// GET /api/admin/applications - Get all applications with user and internship details
router.get('/applications', isAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email department')
      .populate('internship', 'title company location duration stipend')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications: applications.map(app => ({
        id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        coverLetter: app.coverLetter,
        user: app.user,
        internship: app.internship
      }))
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/approve - Approve an application and create allocation
router.post('/approve', isAdmin, async (req, res) => {
  try {
    const { applicationId, startDate, endDate, notes } = req.body;

    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    // Find the application
    const application = await Application.findById(applicationId)
      .populate('user')
      .populate('internship');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is not in pending status' });
    }

    // Check if user already has an allocation
    const existingAllocation = await Allocation.findOne({ user: application.user._id });
    if (existingAllocation) {
      return res.status(400).json({ success: false, message: 'User is already allocated to an internship' });
    }

    // Update application status to approved
    application.status = 'approved';
    await application.save();

    // Create allocation entry
    const allocation = new Allocation({
      user: application.user._id,
      internship: application.internship._id,
      application: application._id,
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes || ''
    });

    await allocation.save();

    res.json({
      success: true,
      message: 'Application approved and allocation created successfully',
      allocation: {
        id: allocation._id,
        user: {
          id: application.user._id,
          name: application.user.name,
          email: application.user.email
        },
        internship: {
          id: application.internship._id,
          title: application.internship.title,
          company: application.internship.company
        },
        allocatedAt: allocation.allocatedAt,
        startDate: allocation.startDate,
        endDate: allocation.endDate
      }
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/reject - Reject an application
router.post('/reject', isAdmin, async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is not in pending status' });
    }

    application.status = 'rejected';
    await application.save();

    res.json({
      success: true,
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const totalAllocations = await Allocation.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalInternships,
        totalApplications,
        pendingApplications,
        approvedApplications,
        totalAllocations
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/allocations - Get all allocations
router.get('/allocations', isAdmin, async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('user', 'name email department')
      .populate('internship', 'title company location')
      .populate('application', 'appliedAt')
      .sort({ allocatedAt: -1 });

    res.json({
      success: true,
      allocations
    });
  } catch (error) {
    console.error('Get all allocations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/internships - Get all internships with application counts
router.get('/internships', isAdmin, async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });

    // Get application counts per internship
    const internshipsWithCounts = await Promise.all(
      internships.map(async (intern) => {
        const applicationCount = await Application.countDocuments({ internship: intern._id });
        const approvedCount = await Application.countDocuments({ internship: intern._id, status: 'approved' });
        return {
          ...intern.toObject(),
          applicationCount,
          approvedCount,
          availableSlots: intern.slots - approvedCount
        };
      })
    );

    res.json({
      success: true,
      internships: internshipsWithCounts
    });
  } catch (error) {
    console.error('Get admin internships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow deleting yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Remove related applications and allocations
    await Application.deleteMany({ user: userId });
    await Allocation.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
