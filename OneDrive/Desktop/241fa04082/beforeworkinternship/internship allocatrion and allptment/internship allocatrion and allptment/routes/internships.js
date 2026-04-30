const express = require('express');
const jwt = require('jsonwebtoken');
const Internship = require('../models/Internship');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// 🔐 Auth middleware
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
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};


// 📌 GET all internships
router.get('/', async (req, res) => {
    try {
        const internships = await Internship.find();
        console.log(`Backend total internships found: ${internships.length}`);
        return res.json({ success: true, internships });

    } catch (error) {
        console.error('Get internships error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch internships' });
    }
});


// 📌 GET single internship
router.get('/:id', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        return res.json({ success: true, internship });

    } catch (error) {
        console.error('Get internship error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch internship' });
    }
});


// 🚀 CREATE internship (TEMP: allow all users)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // ❌ Removed admin restriction

        const { title, company, location, duration, stipend, description, requirements, slots } = req.body;

        if (!title || !company || !location || !duration || !stipend || !description) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const internship = new Internship({
            title,
            company,
            location,
            duration,
            stipend,
            description,
            requirements: requirements || [],
            slots: slots || 1
        });

        await internship.save();

        return res.json({ success: true, internship });

    } catch (error) {
        console.error('Create internship error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create internship' });
    }
});


// ✏️ UPDATE internship
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const internship = await Internship.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        return res.json({ success: true, internship });

    } catch (error) {
        console.error('Update internship error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update internship' });
    }
});


// 🗑 DELETE internship (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        return res.json({ success: true, message: 'Internship deleted successfully' });

    } catch (error) {
        console.error('Delete internship error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete internship' });
    }
});


module.exports = router;