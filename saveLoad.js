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
        alert(getTranslation("pleaseEnterName"));
        return;
    }

    const automatonData = getAutomatonData(); //apo main.js

    if (!automatonData.states.length) {
        alert(getTranslation("noAutomatonToSave"));
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
        alert(getTranslation("saveSuccess"))
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
                    alert(getTranslation("saveToServerSuccess"));
                    console.log("Server response:", data);
                } else {
                    const text = await res.text();
                    console.warn("Non-JSON response:", text);
                    alert(getTranslation("saveResponseNotJson"));
                }
            })
            .catch(err => {
                alert(getTranslation("saveToServerFailed"));
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
            alert(getTranslation("selectJsonFile"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const automaton = JSON.parse(e.target.result);
                loadAutomaton(automaton);
                loadModal.classList.add("hidden");
            } catch (err) {
                alert(getTranslation("invalidJsonFile"));
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
        alert(getTranslation("mustLoginToLoad"));
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
        const list = automatons.automatons || [];

        if (list.length === 0) {
            automatonList.innerHTML = `<li>${getTranslation("noSavedAutomata")}</li>`;
        } else {
            list.forEach(auto => {
                const li = document.createElement("li");
                li.innerHTML = `
            <span>${auto.name}</span>
            <button class="load-from-server-button" data-id="${auto.id}">${getTranslation("loadButtonMyAutomata")}</button>
        `;
                automatonList.appendChild(li);
            });
        }

        serverLoadModal.classList.remove("hidden");

    } catch (err) {
        console.error("Error fetching automatons:", err);
        alert(getTranslation("failedToLoadAutomaton"));
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
                alert(getTranslation("automatonNotFound"));
            }

        } catch (err) {
            console.error("Load single automaton error:", err);
            alert(getTranslation("failedToLoadAutomaton"));
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

        if (data.automatons.length === 0) {
            list.innerHTML = `<li>${getTranslation("noSavedAutomata")}</li>`;
        }

        //lista me saved automata ston server
        data.automatons.forEach(auto => {
            const li = document.createElement("li");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = `${auto.name} (${auto.type})`;

            //edit name
            const editBtn = document.createElement("button");
            editBtn.textContent = getTranslation("editName")
            editBtn.onclick = () => editAutomatonName(auto.id, auto.name);

            //delete 
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = getTranslation("deleteAutomaton")
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
    const newName = prompt(getTranslation("promptRenameAutomaton"), currentName);
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
                    alert(getTranslation("nameUpdatedSuccess"));
                    fetchUserAutomata();
                } else {
                    alert(getTranslation("failedToUpdateName"));
                }
            } else {
                const text = await res.text();
                console.warn("Non-JSON edit response:", text);
                alert(getTranslation("unexpectedServerResponse"));
            }
        })
        .catch(err => {
            console.error("Edit error:", err);
            alert(getTranslation("errorUpdatingAutomaton"));
        });

}

function deleteAutomaton(id) {
    if (!confirm(getTranslation("confirmDeleteAutomaton"))) return;

    fetch(`http://localhost:3000/user/delete?id=${id}`, {
        method: "DELETE"
    })
        .then(async res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.message === "Automaton deleted") {
                    alert(getTranslation("deletedSuccess"));
                    fetchUserAutomata(); // refresh h lista
                } else {
                    alert(getTranslation("failedToDeleteAutomaton"));
                }
            } else {
                const text = await res.text();
                console.warn("Non-JSON delete response:", text);
                alert(getTranslation("unexpectedServerResponse"));
            }
        })
        .catch(err => {
            console.error("Delete error:", err);
            alert(getTranslation("errorDeletingAutomaton"));
        });

}

//sto info modal tou logged in user
document.getElementById("manageAutomata")?.addEventListener("click", () => {
    document.getElementById("server-load-modal").classList.remove("hidden");
    fetchUserAutomata(); //emfanizei th lista automatwn apo server me vash to id tou user
});