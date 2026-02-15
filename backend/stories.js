const router = require("express").Router();
const Story = require("../models/Story");
const User = require("../models/User");

// Create a Text Story
router.post("/", async (req, res) => {
  const newStory = new Story(req.body);
  try {
    const savedStory = await newStory.save();
    return res.status(200).json(savedStory); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

// Get Timeline Stories
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).json("User not found"); // Safety check

    const userStories = await Story.find({ userId: currentUser._id });
    const friendStories = await Promise.all(
      currentUser.friends.map((friendId) => {
        return Story.find({ userId: friendId });
      })
    );
    return res.status(200).json(userStories.concat(...friendStories)); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
  }
});

module.exports = router;