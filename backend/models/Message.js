const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String },
    sender: { type: String },
    text: { type: String },
    seen: { type: Boolean, default: false }, // Read receipt
    reactions: { type: Array, default: [] }, // Stores { userId: "123", emoji: "👍" }
    replyTo: { type: String, default: null }, // ID of message being replied to
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);