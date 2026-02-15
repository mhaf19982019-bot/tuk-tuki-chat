const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json("Email already exists");
        }

        // 2. Hash the password
        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // 4. Save to DB
        const user = await newUser.save();
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        // 1. Find user
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json("User not found"); // ADDED RETURN
        }

        // 2. Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("Wrong password"); // ADDED RETURN
        }

        // 3. Create Token
        // Use a fallback secret if process.env.JWT_SECRET is missing on Render
        const secret = process.env.JWT_SECRET || "tuk_tuki_secret_key_123";
        const token = jwt.sign({ id: user._id }, secret);
        
        // 4. Send back user info
        const { password, ...others } = user._doc; 
        return res.status(200).json({ ...others, token });

    } catch (err) {
        // If an error happens halfway through, only send response if we haven't already
        if (!res.headersSent) {
            return res.status(500).json(err);
        }
    }
});

module.exports = router;