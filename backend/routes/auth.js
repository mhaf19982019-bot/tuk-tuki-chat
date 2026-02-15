const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) return res.status(400).json("Email already exists");

        // 2. Hash the password (security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // 4. Save to DB
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        // 1. Find user
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("User not found");

        // 2. Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong password");

        // 3. Create Token (This is their "ID Card" for the app)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        
        // 4. Send back user info (excluding password)
        const { password, ...others } = user._doc; 
        res.status(200).json({ ...others, token });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;