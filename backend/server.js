const express = require("express");
const cors = require("cors");
const { simulateDFA } = require('./simulators/dfaSimulator');
const { simulateNFA } = require('./simulators/nfaSimulator');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./auth.js');
app.use('/auth', authRoutes);

const saveRoutes = require("./saveRoutes");
app.use("/user", saveRoutes);

app.get("/", (req, res) => {
    res.send("Backend is on");
});

app.post("/simulate", (req, res) => {
    const { automaton, accepted = [] } = req.body;

    if (!automaton || !automaton.states || !automaton.transitions) {
        return res.status(400).json({ error: "Invalid automaton data" });
    }

    try {
        const results = {};

        if (automaton.type === "NFA") {
            accepted.forEach(str => {
                results[str] = simulateNFA(automaton, str);
            });
        } else {
            accepted.forEach(str => {
                results[str] = simulateDFA(automaton, str);
            });
        }

        res.json({ results });
    } catch (error) {
        console.error("Error during simulation:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});