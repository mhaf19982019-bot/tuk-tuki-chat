const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// 1. UPDATE USER (Handles Nickname & Avatar Selection)
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true });
      res.status(200).json("Account updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

// 2. CHANGE PASSWORD
router.put("/:id/password", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
            if (!validPassword) return res.status(400).json("Wrong current password!");

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(req.body.newPassword, salt);

            await user.updateOne({ $set: { password: newHashedPassword } });
            res.status(200).json("Password updated successfully!");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can update only your account!");
    }
});

// 3. BLOCK USER
router.put("/:id/block", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (!user.blockedUsers.includes(req.body.blockId)) {
                await user.updateOne({ $push: { blockedUsers: req.body.blockId } });
                res.status(200).json("User blocked!");
            } else {
                await user.updateOne({ $pull: { blockedUsers: req.body.blockId } });
                res.status(200).json("User unblocked!");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("Action forbidden");
    }
});

// 4. DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Delete only your account!");
  }
});

// 5. GET A USER
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    if (!user) return res.status(404).json("User not found");
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. GET FRIENDS
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.friends.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      if(friend) {
          const { _id, username, nickname, profilePic } = friend;
          friendList.push({ _id, username, nickname, profilePic });
      }
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. GET REQUESTS
router.get("/requests/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found");

    const requests = await Promise.all(
      user.friendRequests.map((requestId) => {
        return User.findById(requestId);
      })
    );
    let requestList = [];
    requests.map((friend) => {
        if(friend) {
            const { _id, username, profilePic } = friend;
            requestList.push({ _id, username, profilePic });
        }
    });
    res.status(200).json(requestList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 8. SEARCH USERS
router.get("/search/:query", async (req, res) => {
    try {
        const users = await User.find({
            username: { $regex: req.params.query, $options: "i" }
        }).limit(10);
        
        const result = users.map(user => ({
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic
        }));
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;