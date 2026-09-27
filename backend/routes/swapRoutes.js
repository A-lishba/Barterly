const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const auth = require("../middleware/auth");
const { askGemini } = require("../utils/gemini");

const router = express.Router();

// @route  POST /api/swap/request
// body: { mentorId, skill, message }
router.post("/request", auth, async (req, res) => {
  try {
    const { mentorId, skill, message } = req.body;
    if (!mentorId || !skill) {
      return res.status(400).json({ message: "mentorId and skill are required" });
    }
    if (mentorId === req.user.id) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const swap = await SwapRequest.create({
      requester: req.user.id,
      mentor: mentorId,
      skill,
      message: message || "",
    });

    res.status(201).json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating swap request" });
  }
});

// @route  GET /api/swap/mine  (requests I sent AND requests sent to me)
router.get("/mine", auth, async (req, res) => {
  try {
        const sent = await SwapRequest.find({ requester: req.user.id })
      .populate("mentor", "name email")
      .populate("messages.sender", "name")
      .sort({ createdAt: -1 });

    const received = await SwapRequest.find({ mentor: req.user.id })
      .populate("requester", "name email")
      .populate("messages.sender", "name")
      .sort({ createdAt: -1 });

    res.json({ sent, received });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching swap requests" });
  }
});

// @route  PUT /api/swap/:id/status
// body: { status: "accepted" | "declined" | "completed" }
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "declined", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    // Only the mentor can accept/decline; either party can mark completed
    if (
      (status === "accepted" || status === "declined") &&
      swap.mentor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Only the mentor can accept or decline this request" });
    }

    swap.status = status;
    await swap.save();
    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating swap status" });
  }
});

// @route  PUT /api/swap/:id/notes
// body: { sessionNotes: "we covered..." }
// Generates a short AI summary of the session automatically
router.put("/:id/notes", auth, async (req, res) => {
  try {
    const { sessionNotes } = req.body;
    if (!sessionNotes || !sessionNotes.trim()) {
      return res.status(400).json({ message: "sessionNotes text is required" });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    swap.sessionNotes = sessionNotes;

    try {
      const summary = await askGemini(
        `Summarize the following mentorship session notes in ONE short encouraging sentence (max 25 words), starting with "You learned":\n\n"${sessionNotes}"`
      );
      swap.aiSummary = summary.trim();
    } catch (aiErr) {
      console.error("AI summary failed, saving notes without it:", aiErr.message);
      swap.aiSummary = "";
    }

    await swap.save();
    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving session notes" });
  }
});

// @route  PUT /api/swap/:id/meeting-link
// body: { meetingLink: "https://meet.google.com/xyz-abcd-efg" }
// Only the mentor can set/update the meeting link, only after the request is accepted
router.put("/:id/meeting-link", auth, async (req, res) => {
  try {
    const { meetingLink } = req.body;
    if (!meetingLink || !meetingLink.trim()) {
      return res.status(400).json({ message: "meetingLink is required" });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    if (swap.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the mentor can add a meeting link" });
    }

    if (swap.status !== "accepted" && swap.status !== "completed") {
      return res.status(400).json({ message: "Request must be accepted before adding a meeting link" });
    }

    swap.meetingLink = meetingLink.trim();
    await swap.save();
    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving meeting link" });
  }
});

// @route  POST /api/swap/:id/message
// body: { text: "Kal 5 baje mil sakte hain?" }
router.post("/:id/message", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    const isParticipant =
      swap.requester.toString() === req.user.id || swap.mentor.toString() === req.user.id;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this swap" });
    }

    swap.messages.push({ sender: req.user.id, text: text.trim() });
    await swap.save();

    const updated = await SwapRequest.findById(swap._id).populate("messages.sender", "name");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// @route  DELETE /api/swap/:id
// Only the requester can cancel their own request, and only while it's still pending
router.delete("/:id", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    if (swap.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own requests" });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error cancelling request" });
  }
});

module.exports = router;

