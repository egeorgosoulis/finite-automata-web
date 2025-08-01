const express = require("express");
const router = express.Router();
const pool = require("./database");

//save to automato sth vash
router.post("/save", async (req, res) => {
    const { name, email, automaton } = req.body;

    if (!name || !email || !automaton || !automaton.type) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id;

        await pool.query(
            "INSERT INTO automata (user_id, name, type, json_data) VALUES ($1, $2, $3, $4)",
            [userId, name, automaton.type, JSON.stringify(automaton)]
        );

        res.status(201).json({ message: "Automaton saved successfully" });
    } catch (error) {
        console.error("Save error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//anakthsh twn saved automatwn tou sundedemenou xrhsth
router.post("/automata", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });

    try {
        const user = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const userId = user.rows[0].id;
        const result = await pool.query(
            "SELECT id, name, type, json_data FROM automata WHERE user_id = $1",
            [userId]
        );
        res.json({ automatons: result.rows });
    } catch (err) {
        console.error("Error fetching automatons:", err);
        res.status(500).json({ message: "Internal error" });
    }
});

//fortwsh automatou
router.get("/loadone", async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Missing automaton ID" });

    try {
        const result = await pool.query("SELECT json_data FROM automata WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Automaton not found" });

        res.json({ json_data: result.rows[0].json_data });
    } catch (err) {
        console.error("Load one error:", err);
        res.status(500).json({ message: "Internal error" });
    }
});

//rename to onoma tou arxeiou sth vash
router.put("/edit", async (req, res) => {
    const { id, newName } = req.body;

    if (!id || !newName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        await pool.query("UPDATE automata SET name = $1 WHERE id = $2", [newName, id]);
        res.status(200).json({ message: "Automaton name updated" });
    } catch (err) {
        console.error("Edit error:", err);
        res.status(500).json({ message: "Server error while editing automaton" });
    }
});

//diagrafh arxeiou sth vash
router.delete("/delete", async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "Missing automaton ID" });
    }

    try {
        await pool.query("DELETE FROM automata WHERE id = $1", [id]);
        res.status(200).json({ message: "Automaton deleted" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Server error while deleting automaton" });
    }
});

//epistrefei th lista me ta automata sumfwna me id
router.get("/load", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Missing email" });

    try {
        const user = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const userId = user.rows[0].id;
        const result = await pool.query("SELECT id, name FROM automata WHERE user_id = $1", [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Load error:", err);
        res.status(500).json({ message: "Internal error" });
    }
});

module.exports = router;