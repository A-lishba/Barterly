const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { askGemini, cleanJson } = require("../utils/gemini");

const router = express.Router();

// @route  POST /api/match/suggest
// body: { skill: "React hooks" }
// Uses Gemini to rank the best mentors for the skill the user wants to learn
router.post("/suggest", auth, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || !skill.trim()) {
      return res.status(400).json({ message: "Please provide a skill you want to learn" });
    }

    const candidates = await User.find({ _id: { $ne: req.user.id } }).select(
      "name bio skillsHave skillsWant"
    );

    if (candidates.length === 0) {
      return res.json({ matches: [], note: "No other users on Barterly yet." });
    }

    const candidateList = candidates
      .map(
        (c, i) =>
          `${i + 1}. id: ${c._id} | name: ${c.name} | bio: ${c.bio || "N/A"} | skills they can teach: ${
            c.skillsHave.join(", ") || "none listed"
          }`
      )
      .join("\n");

    const prompt = `You are a mentorship-matching assistant for a skill-swap platform called Barterly.
A user wants to learn: "${skill}".

Here is a list of other users on the platform:
${candidateList}

Pick the TOP 3 best possible mentors for this skill from the list above (fewer if there aren't 3 good matches, or an empty list if none are relevant at all).
Respond with ONLY valid JSON, no markdown, no extra text, in exactly this format:
[
  { "id": "<user id from the list>", "name": "<their name>", "reason": "<one short sentence explaining why they're a good match, referencing their actual listed skills or bio>" }
]`;

    const raw = await askGemini(prompt);
    let matches = [];
    try {
      matches = JSON.parse(cleanJson(raw));
    } catch (parseErr) {
      console.error("Failed to parse Gemini match response:", raw);
      return res.status(502).json({ message: "AI response could not be parsed. Try again." });
    }

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error generating matches" });
  }
});

module.exports = router;
