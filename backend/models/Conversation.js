const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: { type: Array, required: true }, // List of all user IDs in the chat
    isGroup: { type: Boolean, default: false }, // Is this a group?
    name: { type: String, default: "" }, // Group Name (e.g., "Family", "Trip")
    admin: { type: String }, // User ID of the person who created the group
    groupImage: { type: String, default: "" }, // Group Icon
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);