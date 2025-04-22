const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('./backend/database');

//REGISTER
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query("INSERT INTO users (email, password_hash) VALUES ($1,$2)",
            [email, hashedPassword]
        );
        res.status(200).json({ message: "Registration successful" });

    }
    catch (Error) {
        console.error("Register Error:", Error);
        res.status(500).json({ message: "Server error while registering" });
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: "Login successful", userId: user.id })
    }
    catch (Error) {
        console.error("Login Error:", Error);
        res.status(500).json({ message: "Server error during login" })
    }
})

module.exports = router;