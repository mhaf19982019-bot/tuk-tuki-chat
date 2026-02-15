const router = require("express").Router();
const Message = require("../models/Message");

// 1. ADD MESSAGE
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET MESSAGES IN A CONVERSATION
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. MARK MESSAGES AS SEEN (NEW!)
router.put("/seen/:conversationId", async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, sender: { $ne: req.body.userId } }, // Update messages I didn't send
            { $set: { seen: true } }
        );
        res.status(200).json("Messages marked as seen");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;