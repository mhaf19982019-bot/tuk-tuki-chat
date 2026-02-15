const router = require("express").Router();
const Story = require("../models/Story");
const User = require("../models/User");

// Create a Text Story
router.post("/", async (req, res) => {
  const newStory = new Story(req.body);
  try {
    const savedStory = await newStory.save();
    res.status(200).json(savedStory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Timeline Stories (Your friends' stories)
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userStories = await Story.find({ userId: currentUser._id });
    const friendStories = await Promise.all(
      currentUser.friends.map((friendId) => {
        return Story.find({ userId: friendId });
      })
    );
    res.status(200).json(userStories.concat(...friendStories));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;