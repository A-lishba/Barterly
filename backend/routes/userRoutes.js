const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// @route  PUT /api/users/me
// body: { bio, skillsHave: [], skillsWant: [] }
router.put("/me", auth, async (req, res) => {
  try {
    const { bio, skillsHave, skillsWant } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(bio !== undefined && { bio }),
        ...(skillsHave !== undefined && { skillsHave }),
        ...(skillsWant !== undefined && { skillsWant }),
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// @route  GET /api/users  (list everyone except me — used for browsing)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

module.exports = router;
