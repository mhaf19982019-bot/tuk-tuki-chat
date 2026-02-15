const router = require("express").Router();
const Conversation = require("../models/Conversation");

// 1. Create New Conversation
router.post("/", async (req, res) => {
  let newConversation;
  
  if (req.body.isGroup) {
      newConversation = new Conversation({
          members: [req.body.senderId, ...req.body.receiverIds],
          isGroup: true,
          name: req.body.name,
          admin: req.body.senderId,
          groupImage: req.body.groupImage || ""
      });
  } else {
      newConversation = new Conversation({
          members: [req.body.senderId, req.body.receiverId],
      });
  }

  try {
    const savedConversation = await newConversation.save();
    return res.status(200).json(savedConversation); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

// 2. Get Conversations for a User
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    return res.status(200).json(conversation); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

// 3. Rename Group
router.put("/rename/:conversationId", async (req, res) => {
    try {
        const updatedGroup = await Conversation.findByIdAndUpdate(
            req.params.conversationId,
            { $set: { name: req.body.name } },
            { new: true }
        );
        return res.status(200).json(updatedGroup); // Added return
    } catch (err) {
        return res.status(500).json(err); // Added return
    }
});

module.exports = router;