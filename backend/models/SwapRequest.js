const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true, trim: true }, // skill being requested
    message: { type: String, default: "", maxlength: 300 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
        sessionNotes: { type: String, default: "" },
    aiSummary: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
