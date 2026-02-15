// LOGIN - Bulletproof Version
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json("User not found");
        } 
        
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        
        if (!validPassword) {
            return res.status(400).json("Wrong password");
        }

        // If it gets here, we are 100% sure NO error response was sent
        const secret = process.env.JWT_SECRET || "tuk_tuki_secret_key_123";
        const token = jwt.sign({ id: user._id }, secret);
        const { password, ...others } = user._doc; 
        
        return res.status(200).json({ ...others, token });

    } catch (err) {
        console.error("Login Error:", err);
        if (!res.headersSent) {
            return res.status(500).json("Internal Server Error");
        }
    }
});