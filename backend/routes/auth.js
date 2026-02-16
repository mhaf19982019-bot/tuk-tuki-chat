const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) return res.status(400).json("Email already exists");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

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
            return res.status(404).json("User not found");
        }

        // 2. Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("Wrong password");
        }

        // 3. Success
        const secret = process.env.JWT_SECRET || "tuk_tuki_secret_key_123";
        const token = jwt.sign({ id: user._id }, secret);
        const { password, ...others } = user._doc; 
        
        return res.status(200).json({ ...others, token });
    } catch (err) {
        if (!res.headersSent) {
            return res.status(500).json(err);
        }
    }
});

module.exports = router;
