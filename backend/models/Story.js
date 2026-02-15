const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true }, // Only text stories as requested
    backgroundColor: { type: String, default: "#000000" }, // Custom background
    expiresAt: { type: Date, expires: 86400 } // Auto-delete after 24 hours
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);