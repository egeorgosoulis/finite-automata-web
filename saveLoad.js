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
        automaton: automatonData
    };

    //topiko save se json
    if (downloadJson) {
        downloadFA(automatonData, name);
        alert("Save successful")
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

    console.log("Resetting checkboxes...");
    document.getElementById("loadFromFile").checked = false;
    document.getElementById("loadFromServer").checked = false;
    document.getElementById("loadFileInput").value = "";
});

closeLoadButton?.addEventListener("click", () => loadModal.classList.add("hidden"));
cancelLoadButton?.addEventListener("click", () => loadModal.classList.add("hidden"));

loadFromFileCheckbox?.addEventListener("change", () => {
    loadFileInput.classList.toggle("hidden", !loadFromFileCheckbox.checked);
});


confirmLoadButton?.addEventListener("click", () => {
    const loadFromFile = loadFromFileCheckbox?.checked;
    const loadFromServer = loadFromServerCheckbox?.checked;


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