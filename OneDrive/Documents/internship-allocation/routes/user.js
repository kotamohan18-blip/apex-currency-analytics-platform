const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); // adjust if path differs

// GET /api/user/me
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;