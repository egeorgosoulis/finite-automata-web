// SAVE
const saveModal = document.getElementById("save-modal");
const openSaveButton = document.getElementById("saveFA");
const closeSaveModal = document.getElementById("closeSaveButton");
const cancelSave = document.getElementById("cancelSave");
const confirmSaveButton = document.getElementById("confirmSave");

openSaveButton?.addEventListener("click", () => {
    const isLoggedIn = !!localStorage.getItem("userEmail");

    saveModal.classList.remove("hidden");
    document.getElementById("saveOptionsLoggedIn").classList.toggle("hidden", !isLoggedIn);
    document.getElementById("saveWarning").classList.toggle("hidden", isLoggedIn);

    document.getElementById("automatonName").value = "";
    document.getElementById("downloadJSON").checked = false;
    document.getElementById("saveToServer").checked = false;
});

closeSaveModal?.addEventListener("click", () => saveModal.classList.add("hidden"));
cancelSave?.addEventListener("click", () => saveModal.classList.add("hidden"));

confirmSaveButton?.addEventListener("click", () => {
    const name = document.getElementById("automatonName").value.trim();
    const saveToServer = document.getElementById("saveToServer")?.checked;
    const downloadJson = document.getElementById("downloadJSON")?.checked;
    const email = localStorage.getItem("userEmail");

    if (!name) {
        alert("Please enter a name for your automaton.");
        return;
    }

    const automatonData = getAutomatonData(); //apo main.js

    if (!automatonData.states.length) {
        alert("No automaton to save!");
        return;
    }

    const payload = {
        name,
        email,
        automaton: getAutomatonData()
    };

    //topiko save se json
    if (downloadJson) {
        downloadFA(automatonData, name);
        alert("Save successful")
    }

    //save se server 
    if (saveToServer && email) {
        fetch("http://localhost:3000/user/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(async res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    alert("Saved to server successfully!");
                    console.log("Server response:", data);
                } else {
                    const text = await res.text();
                    console.warn("Non-JSON response:", text);
                    alert("Saved, but response is not JSON.");
                }
            })
            .catch(err => {
                alert("Failed to save to server.");
                console.error("Save error:", err);
            });
    }
});

function downloadFA(automaton, name = "automaton") {
    const dataStr = JSON.stringify(automaton, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

// LOAD
const loadModal = document.getElementById("load-modal");
const openLoadButton = document.getElementById("loadFA");
const closeLoadButton = document.getElementById("closeLoadButton");
const cancelLoadButton = document.getElementById("cancelLoad");
const confirmLoadButton = document.getElementById("confirmLoad");

const loadFromFileCheckbox = document.getElementById("loadFromFile");
const loadFromServerCheckbox = document.getElementById("loadFromServer");
const loadFileInput = document.getElementById("loadFileInput");

openLoadButton?.addEventListener("click", () => {
    const isLoggedIn = !!localStorage.getItem("userEmail");
    loadModal.classList.remove("hidden");

    document.getElementById("loadOptionsLoggedIn").classList.toggle("hidden", !isLoggedIn);
    document.getElementById("loadWarning").classList.toggle("hidden", isLoggedIn);

    loadFileInput.value = "";

    document.getElementById("loadFromFile").checked = false;
    document.getElementById("loadFromServer").checked = false;
    loadFileInput.classList.add("hidden");
    document.getElementById("loadFileInput").value = "";
});

closeLoadButton?.addEventListener("click", () => loadModal.classList.add("hidden"));
cancelLoadButton?.addEventListener("click", () => loadModal.classList.add("hidden"));

//den epitrepontai kai oi duo epiloges checked
loadFromServerCheckbox?.addEventListener("change", () => {
    if (loadFromServerCheckbox.checked) {
        loadFromFileCheckbox.checked = false;
        loadFileInput.classList.add("hidden");
    }
});

//otan epilextei h mia apoepilegetai h allh
loadFromFileCheckbox?.addEventListener("change", () => {
    if (loadFromFileCheckbox.checked) {
        loadFromServerCheckbox.checked = false;
        loadFileInput.classList.remove("hidden");
    } else {
        loadFileInput.classList.add("hidden");
    }
});


confirmLoadButton?.addEventListener("click", () => {
    const loadFromFile = loadFromFileCheckbox?.checked;

    //fortwsh apo topiko json arxeio
    if (loadFromFile) {
        const file = loadFileInput.files[0];
        if (!file) {
            alert("Please select a .json file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const automaton = JSON.parse(e.target.result);
                loadAutomaton(automaton);
                loadModal.classList.add("hidden");
            } catch (err) {
                alert("Invalid JSON file.");
                console.error("Load error:", err);
            }
        };
        reader.readAsText(file);
    }
});

function loadAutomaton(automaton) {
    const svg = document.getElementById("svg-area");
    clearSvgArea() //clear prwta to svg area

    //gia arrowheads
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
        </marker>
    `;
    svg.appendChild(defs);

    //diavazei ton tupo FA kai allazei thn epilogh automatou
    if (automaton.type) {
        const radio = document.querySelector(`input[name="automaton"][value="${automaton.type}"]`);
        if (radio) radio.checked = true;
    }

    //dhmiourgia states sto svg-area
    automaton.states.forEach(state => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "state");
        group.setAttribute("data-id", state.id);
        if (state.isInitial) group.setAttribute("data-initial", "true");
        if (state.isFinal) group.setAttribute("data-final", "true");

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", state.x);
        circle.setAttribute("cy", state.y);
        circle.setAttribute("r", 30);
        circle.setAttribute("fill", state.color || "orange");
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("data-id", state.id);
        group.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", state.x);
        text.setAttribute("y", state.y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("font-size", "18");
        text.textContent = state.id;
        group.appendChild(text);

        //intial
        if (state.isInitial) {
            const arrowSize = 10;
            const trianglePoints = `${state.x - 30 - arrowSize},${state.y} 
                                    ${state.x - 30 - 2 * arrowSize},${state.y - arrowSize} 
                                    ${state.x - 30 - 2 * arrowSize},${state.y + arrowSize}`;
            const initialArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            initialArrow.setAttribute("points", trianglePoints);
            initialArrow.setAttribute("fill", "black");
            initialArrow.setAttribute("class", "initial-arrow");
            group.prepend(initialArrow);
        }

        //final
        if (state.isFinal) {
            const finalCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            finalCircle.setAttribute("cx", state.x);
            finalCircle.setAttribute("cy", state.y);
            finalCircle.setAttribute("r", 36);
            finalCircle.setAttribute("stroke", "black");
            finalCircle.setAttribute("stroke-width", "2");
            finalCircle.setAttribute("fill", "none");
            finalCircle.setAttribute("class", "final-circle");
            group.appendChild(finalCircle);
        }

        svg.appendChild(group);
    });

    //transitions
    automaton.transitions.forEach(t => {
        const fromCircle = [...document.querySelectorAll('.state circle')].find(c => c.getAttribute("data-id") === t.from);
        const toCircle = [...document.querySelectorAll('.state circle')].find(c => c.getAttribute("data-id") === t.to);

        if (!fromCircle || !toCircle) return;

        if (t.from === t.to) {
            drawSelfLoop(fromCircle, t.symbol);
        } else {
            addTransition(fromCircle, toCircle, t.symbol);
        }
    });
}

const serverLoadModal = document.getElementById("server-load-modal");
const closeServerLoadButton = document.getElementById("closeServerLoadButton");
const cancelServerLoad = document.getElementById("cancelServerLoad");
const automatonList = document.getElementById("automatonList");

// me confirm load apo server
confirmLoadButton?.addEventListener("click", async () => {
    const loadFromServer = loadFromServerCheckbox?.checked;
    if (!loadFromServer) return; //anoigei th lista gia load xwris epilogh

    const email = localStorage.getItem("userEmail");
    if (!email) {
        alert("You must be logged in to load from server.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/user/automata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const automatons = await response.json();

        automatonList.innerHTML = ""; //reset h lista
        if (automatons.length === 0) {
            automatonList.innerHTML = "<li>No saved automatons found.</li>";
        } else {
            automatons.automatons.forEach(auto => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${auto.name}</span>
                    <button class="load-from-server-button" data-id="${auto.id}">Load</button>
                `;
                automatonList.appendChild(li);
            });
        }

        serverLoadModal.classList.remove("hidden");

    } catch (err) {
        console.error("Error fetching automatons:", err);
        alert("Failed to load automatons from server.");
    }
});

closeServerLoadButton?.addEventListener("click", () => serverLoadModal.classList.add("hidden"));
cancelServerLoad?.addEventListener("click", () => serverLoadModal.classList.add("hidden"));

automatonList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("load-from-server-button")) {
        const id = e.target.dataset.id;

        try {
            const res = await fetch(`http://localhost:3000/user/loadone?id=${id}`);
            const data = await res.json();

            if (data && data.json_data) {
                loadAutomaton(data.json_data);
                serverLoadModal.classList.add("hidden");
                loadModal.classList.add("hidden");
            } else {
                alert("Automaton not found or invalid.");
            }

        } catch (err) {
            console.error("Load single automaton error:", err);
            alert("Failed to load automaton.");
        }
    }
});

const manageModal = document.getElementById("manage-modal");
const openManageModal = document.getElementById("openManageModal");
const closeManageModal = document.getElementById("closeManageModal");
const cancelManage = document.getElementById("cancelManage");

openManageModal?.addEventListener("click", () => {
    manageModal.classList.remove("hidden");

    fetchUserAutomata();
});

closeManageModal?.addEventListener("click", () => manageModal.classList.add("hidden"));
cancelManage?.addEventListener("click", () => manageModal.classList.add("hidden"));

async function fetchUserAutomata() {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    try {
        const res = await fetch("http://localhost:3000/user/automata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        console.log("Automata received:", data);

        const list = document.getElementById("manageAutomatonList");
        list.innerHTML = "";

        //lista me saved automata ston server
        data.automatons.forEach(auto => {
            const li = document.createElement("li");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = `${auto.name} (${auto.type})`;

            //edit name
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit name";
            editBtn.onclick = () => editAutomatonName(auto.id, auto.name);

            //delete 
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteAutomaton(auto.id);

            const buttonGroup = document.createElement("div");
            buttonGroup.classList.add("button-group");
            buttonGroup.append(editBtn, deleteBtn);

            li.append(nameSpan, buttonGroup);
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Error fetching automatons:", err);
    }
}

function editAutomatonName(id, currentName) {
    const newName = prompt("Enter new name for the automaton:", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;

    fetch("http://localhost:3000/user/edit", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, newName })
    })
        .then(async res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.message === "Automaton name updated") {
                    alert("Name updated successfully!");
                    fetchUserAutomata();
                } else {
                    alert("Failed to update name.");
                }
            } else {
                const text = await res.text();
                console.warn("Non-JSON edit response:", text);
                alert("Unexpected server response.");
            }
        })
        .catch(err => {
            console.error("Edit error:", err);
            alert("Error updating automaton name.");
        });

}

function deleteAutomaton(id) {
    if (!confirm("Are you sure you want to delete this automaton?")) return;

    fetch(`http://localhost:3000/user/delete?id=${id}`, {
        method: "DELETE"
    })
        .then(async res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.message === "Automaton deleted") {
                    alert("Deleted successfully!");
                    fetchUserAutomata(); // refresh h lista
                } else {
                    alert("Failed to delete automaton.");
                }
            } else {
                const text = await res.text();
                console.warn("Non-JSON delete response:", text);
                alert("Unexpected server response.");
            }
        })
        .catch(err => {
            console.error("Delete error:", err);
            alert("Error deleting automaton.");
        });

}
router.put("/edit", async (req, res) => {
    const { id, newName } = req.body;

    if (!id || !newName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        await pool.query("UPDATE automata SET name = $1 WHERE id = $2", [newName, id]);
        res.json({ message: "Automaton name updated" });
    } catch (err) {
        console.error("Edit error:", err);
        res.status(500).json({ message: "Server error while editing automaton" });
    }
});

router.delete("/delete", async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "Missing automaton ID" });
    }

    try {
        await pool.query("DELETE FROM automata WHERE id = $1", [id]);
        res.json({ message: "Automaton deleted" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Server error while deleting automaton" });
    }
});

//sto info modal tou logged in user
document.getElementById("manageAutomata")?.addEventListener("click", () => {
    document.getElementById("server-load-modal").classList.remove("hidden");
    fetchUserAutomata(); //emfanizei th lista automatwn apo server me vash to id tou user
});