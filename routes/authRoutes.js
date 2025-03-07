const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

// @route    POST /api/auth/register
// @desc     Register new user
router.post(
    "/register",
    [
        body("name", "Name is required").not().isEmpty(),
        body("email", "Please include a valid email").isEmail(),
        body("password", "Password must be at least 6 characters").isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ msg: "User already exists" });

            user = new User({ name, email, password });
            await user.save();

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(201).json({ token, user: { id: user._id, name, email } });

        } catch (err) {
            res.status(500).json({ msg: "Server error" });
        }
    }
);

// @route    POST /api/auth/login
// @desc     Login user
router.post(
    "/login",
    [
        body("email", "Please include a valid email").isEmail(),
        body("password", "Password is required").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) return res.status(400).json({ msg: "Invalid credentials" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ token, user: { id: user._id, name: user.name, email } });

        } catch (err) {
            res.status(500).json({ msg: "Server error" });
        }
    }
);

module.exports = router;
