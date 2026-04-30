const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
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

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        return res.json({
            success: true,
            name: user.name,
            email: user.email,
            skills: user.skills || ["JavaScript", "HTML", "CSS", "React", "Node.js"],
            profile: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                createdAt: user.createdAt,
                skills: user.skills
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { name, department, skills } = req.body;
        const user = req.user;
        
        if (name) user.name = name;
        if (department) user.department = department;
        if (skills) user.skills = skills;
        
        await user.save();
        
        return res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                skills: user.skills
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

module.exports = router;
