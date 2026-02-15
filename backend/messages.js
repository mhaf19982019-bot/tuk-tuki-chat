const router = require("express").Router();
const Message = require("../models/Message");

// 1. ADD MESSAGE
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    return res.status(200).json(savedMessage); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

// 2. GET MESSAGES IN A CONVERSATION
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    return res.status(200).json(messages); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

// 3. MARK MESSAGES AS SEEN
router.put("/seen/:conversationId", async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, sender: { $ne: req.body.userId } },
            { $set: { seen: true } }
        );
        return res.status(200).json("Messages marked as seen"); // Added return
    } catch (err) {
        return res.status(500).json(err); // Added return
    }
});

module.exports = router;