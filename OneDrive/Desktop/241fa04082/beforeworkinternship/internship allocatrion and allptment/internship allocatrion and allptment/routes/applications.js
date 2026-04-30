const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Application = require('../models/Application');
const Allocation = require('../models/Allocation');
const Internship = require('../models/Internship');
const User = require('../models/User');

const jwt = require('jsonwebtoken');

// 📁 Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// 🔐 AUTH MIDDLEWARE
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
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};


//////////////////////////////////////////////////////////
// 📄 GET MY APPLICATIONS
//////////////////////////////////////////////////////////

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ user: userId })
      .select('internship status createdAt')
      .populate('internship', 'title company location duration')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications: applications.map(app => ({
        internshipId: app.internship ? app.internship._id.toString() : null,
        internship: app.internship, // populated object
        status: app.status,
        appliedAt: app.createdAt
      }))
    });

  } catch (error) {
    console.error('Fetch applications error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


//////////////////////////////////////////////////////////
// 🚀 APPLY FOR INTERNSHIP (MAIN FIXED ROUTE)
//////////////////////////////////////////////////////////

router.post('/', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { internshipId, name, skills, why } = req.body;
    const userId = req.user._id;

    // 🔍 Validate internship
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // 🚫 Prevent duplicate apply
    const existingApplication = await Application.findOne({
      user: userId,
      internship: internshipId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Already applied'
      });
    }

    // 🚫 Prevent multiple allocation
    const existingAllocation = await Allocation.findOne({ user: userId });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Already allocated to an internship'
      });
    }

    // ✅ Save application (WITH form data + resume)
    const application = new Application({
      user: userId,
      internship: internshipId,
      name,
      skills,
      why,
      status: 'pending',
      resume: req.file ? req.file.path : null
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


//////////////////////////////////////////////////////////
// 🎯 GET MY ALLOCATION
//////////////////////////////////////////////////////////

router.get('/my-allocation', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const allocation = await Allocation.findOne({ user: userId })
      .populate('internship')
      .populate('application');

    if (!allocation) {
      return res.json({
        success: true,
        allocated: false
      });
    }

    return res.json({
      success: true,
      allocated: true,
      allocation
    });

  } catch (error) {
    console.error('Allocation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


//////////////////////////////////////////////////////////
// 🗑 CLEAR ALL APPLICATIONS (TEMPORARY DEV ROUTE)
//////////////////////////////////////////////////////////
router.get('/clear', async (req, res) => {
    try {
        await Application.deleteMany({});
        res.json({ success: true, message: "All applications cleared" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});


module.exports = router;