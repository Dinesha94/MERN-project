const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET /api/users → get all users (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("_id name email role profilePicture").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/users/:id → get specific user
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id name email role profilePicture");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
