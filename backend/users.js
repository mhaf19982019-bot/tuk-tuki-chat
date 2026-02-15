const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// 1. UPDATE USER
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true });
      return res.status(200).json("Account updated"); // Added return
    } catch (err) {
      return res.status(500).json(err); // Added return
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
            return res.status(200).json("Password updated successfully!"); // Added return
        } catch (err) {
            return res.status(500).json(err); // Added return
        }
    } else {
        return res.status(403).json("Action forbidden");
    }
});

// 3. BLOCK USER
router.put("/:id/block", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (!user.blockedUsers.includes(req.body.blockId)) {
                await user.updateOne({ $push: { blockedUsers: req.body.blockId } });
                return res.status(200).json("User blocked!"); // Added return
            } else {
                await user.updateOne({ $pull: { blockedUsers: req.body.blockId } });
                return res.status(200).json("User unblocked!"); // Added return
            }
        } catch (err) {
            return res.status(500).json(err); // Added return
        }
    } else {
        return res.status(403).json("Action forbidden");
    }
});

// 4. DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Account deleted"); // Added return
    } catch (err) {
      return res.status(500).json(err); // Added return
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
    return res.status(200).json(other); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
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
    return res.status(200).json(friendList); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
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
    return res.status(200).json(requestList); // Added return
  } catch (err) {
    return res.status(500).json(err); // Added return
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
        return res.status(200).json(result); // Added return
    } catch (err) {
        return res.status(500).json(err); // Added return
    }
});

module.exports = router;