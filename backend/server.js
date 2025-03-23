const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const { simulateDFA } = require('./simulators/dfaSimulator');
const { simulateNFA } = require('./simulators/nfaSimulator');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

const saveDir = path.join(__dirname, "savedFAs");
if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);

app.get("/", (req, res) => {
    res.send("Backend is on");
});

app.post("/save", (req, res) => {
    const automaton = req.body;
    const id = uuidv4();
    const filePath = path.join(saveDir, `${id}.json`);

    fs.writeFile(filePath, JSON.stringify(automaton, null, 2), err => {
        if (err) {
            return res.status(500).json({ error: "unsuccessful saving" });
        }
        res.json({ status: "success", id });
    })
});

app.post("/simulate", (req, res) => {
    const { automaton, accepted = [] } = req.body;
    console.log("Simulation type:", automaton.type);
    try {
        const results = {};
        let simulator;

        if (automaton.type === "NFA") {
            simulator = simulateNFA;
        } else {
            simulator = simulateDFA;
        }

        accepted.forEach(str => {
            results[str] = simulateDFA(automaton, str)
        });
        res.json({ results });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})