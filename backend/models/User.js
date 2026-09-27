const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 400 },
    skillsHave: [{ type: String, trim: true }], // skills this user can teach
    skillsWant: [{ type: String, trim: true }], // skills this user wants to learn
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
