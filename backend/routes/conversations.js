const router = require("express").Router();
const Conversation = require("../models/Conversation");

// 1. Create New Conversation (1-on-1 OR Group)
router.post("/", async (req, res) => {
  // If it's a group, we expect: { senderId, receiverIds: [], isGroup: true, name: "My Group" }
  // If it's 1-on-1: { senderId, receiverId }
  
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
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Get Conversations for a User
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
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
        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;