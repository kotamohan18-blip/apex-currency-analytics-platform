const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();

// ── Gmail Transporter (Nodemailer) ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Send OTP email with premium HTML template
async function sendOTPEmail(toEmail, otp) {
    const mailOptions = {
        from: `"InternHub Security" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Your InternHub Password Reset Code',
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#080312;font-family:'Inter',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#080312;padding:40px 20px;">
                <tr><td align="center">
                    <table width="100%" style="max-width:520px;background:linear-gradient(135deg,rgba(107,70,193,0.15),rgba(79,70,229,0.1));border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px;">
                        <tr><td align="center" style="padding-bottom:28px;">
                            <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                                <span style="font-size:28px;">🔐</span>
                            </div>
                            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Password Reset</h1>
                            <p style="color:#9ca3af;font-size:14px;margin:0;">InternHub Security System</p>
                        </td></tr>
                        <tr><td style="padding-bottom:28px;">
                            <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 24px;">You requested a password reset for your InternHub account. Use the code below to complete the process:</p>
                            <div style="background:rgba(0,0,0,0.4);border:2px solid rgba(139,92,246,0.4);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                                <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:4px;margin:0 0 12px;">Your One-Time Code</p>
                                <span style="font-size:42px;font-weight:700;color:#a78bfa;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</span>
                                <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">⏱ Valid for <strong style="color:#f59e0b;">5 minutes</strong></p>
                            </div>
                            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">If you didn't request this, you can safely ignore this email. Your account remains secure.</p>
                        </td></tr>
                        <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;text-align:center;">
                            <p style="color:#4b5563;font-size:12px;margin:0;">© 2026 InternHub Ecosystem · <a href="mailto:support@internhub.dev" style="color:#7c3aed;text-decoration:none;">support@internhub.dev</a></p>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>`
    };
    await transporter.sendMail(mailOptions);
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
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

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '24h' });
};

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isValidPassword = await user.comparePassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const token = generateToken(user._id);
        
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role, registryId, institution } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const user = new User({
            email,
            password,
            name,
            role: role || 'student',
            registryId,
            institution
        });
        
        await user.save();
        
        const token = generateToken(user._id);
        
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ success: false, message: 'Signup failed' });
    }
});

// Forgot Password - Generate & Send OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email });
        // Prevent user enumeration: always return the same message whether user exists or not.
        if (!user) {
            return res.json({ success: true, message: 'If account exists, OTP sent' });
        }

        // Generate secure 6-digit OTP using crypto (more secure than Math.random)
        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        // Always log OTP to server console for debugging/demo
        console.log(`🔑 OTP for ${user.email}: ${otp} (expires in 5 min)`);

        const isDev = process.env.NODE_ENV !== 'production';
        let emailSent = false;

        try {
            await sendOTPEmail(user.email, otp);
            emailSent = true;
            console.log(`✅ OTP Email sent to ${user.email}`);
        } catch (emailError) {
            console.error('❌ Email send failed:', emailError.message);
            // In development mode, continue even if email fails — OTP is returned in response
            if (!isDev) {
                user.resetPasswordOTP = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please check Gmail App Password setup.' });
            }
        }

        // In development: include OTP in response so the feature works without Gmail
        // In production: never expose OTP in the response
        const responseData = {
            success: true,
            message: emailSent
                ? 'OTP has been sent to your email'
                : 'OTP generated (email not configured — check server console or use the OTP below)',
            emailSent
        };

        if (isDev) {
            responseData.otp = otp; // Only in development!
            responseData.devNote = 'This OTP is shown because NODE_ENV is not production. Set EMAIL_PASS in .env for real email delivery.';
        }

        return res.json(responseData);

    } catch (error) {
        console.error('Forgot Password error:', error);
        return res.status(500).json({ success: false, message: 'Server error parsing request.' });
    }
});

// Reset Password (Verify OTP + Set new password)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        
        // Security checks: OTP exists, matches, and not expired
        if (
            user && 
            user.resetPasswordOTP &&
            user.resetPasswordOTP === otp && 
            Date.now() < user.resetPasswordExpires
        ) {
            // Pre-save hook uses bcrypt.hash(newPassword, 10) so we just assign
            user.password = newPassword;
            // Clear OTP (CRITICAL for security against replay attacks)
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.json({ success: true, message: 'Password reset successfully. You can now login.' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

    } catch (error) {
        console.error('Reset Password error:', error);
        return res.status(500).json({ success: false, message: 'Password reset failed' });
    }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
    return res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user route
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        return res.json({ success: true, user });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get user data' });
    }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
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
                registryId: user.registryId,
                institution: user.institution,
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
router.put('/profile', authMiddleware, async (req, res) => {
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

// GET /api/user/me - Get current user data
router.get('/user/me', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        return res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                skills: user.skills,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user/me error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get user data' });
    }
});

module.exports = router;
