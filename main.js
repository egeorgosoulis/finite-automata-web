// STATES -- STATES -- STATES
document.getElementById("addState").addEventListener("click", function () {
    const svg = document.getElementById("svg-area");

    //dhmiourgei katastash me ton epomeno arithmo (kai se periptwsh remove state)
    function getNextStateId() {
        const used = new Set(
            [...document.querySelectorAll(".state circle[data-id]")]
                .map(c => parseInt(c.getAttribute("data-id").slice(1)))
        );

        let i = 0;
        while (used.has(i)) i++;
        return `q${i}`;
    }

    let stateId = getNextStateId();
    let svgRect = svg.getBoundingClientRect(); //bounds tou svg
    let numericId = parseInt(stateId.slice(1));

    const posX = Math.min(50 + numericId * 80, svgRect.width - 40);
    const posY = Math.min(100, svgRect.height - 40);

    //dhmiourgia group gia kathe state me onoma
    const stateGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    stateGroup.setAttribute("id", `state-${stateId}`);
    stateGroup.setAttribute("class", "state");

    //dhmiourgia katastashs
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", posX);
    circle.setAttribute("cy", posY);
    circle.setAttribute("r", "30");
    circle.setAttribute("stroke", "var(--stroke-color)");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", "orange");

    circle.setAttribute("data-id", stateId);

    //onoma ths katastashs
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", posX);
    text.setAttribute("y", posY);
    text.setAttribute("font-size", "18");
    text.setAttribute("fill", "black");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = stateId;

    //group thn katastash kai to onoma ths
    stateGroup.appendChild(circle);
    stateGroup.appendChild(text);

    //append sto svg-area
    svg.appendChild(stateGroup);
});

//delete thn epilegmenh katastash
document.getElementById("removeState").addEventListener("click", function () {
    const svg = document.getElementById("svg-area");
    let states = svg.getElementsByClassName("state");

    if (states.length > 0) {
        const selectedCircle = svg.querySelector(".selected-state");
        const stateGroup = selectedCircle?.closest("g.state");

        if (selectedCircle && stateGroup) {
            const stateId = selectedCircle.getAttribute("data-id");

            //afairei metavaseis + label ean uparxoun sthn deleted katastash 
            document.querySelectorAll(`.transition[data-from="${stateId}"], .transition[data-to="${stateId}"]`)
                .forEach(t => {
                    const symbol = t.getAttribute("data-symbol");
                    const from = t.getAttribute("data-from");
                    const to = t.getAttribute("data-to");
                    const labelGroup = svg.querySelector(`.transition-label[data-transition-id="${from}-${to}-${symbol}"]`);
                    if (labelGroup) labelGroup.remove();

                    t.remove();
                });

            svg.removeChild(stateGroup);
        } else {
            alert(getTranslation("alertStateSelect"));
        }
    } else {
        alert(getTranslation("alertStatesRemove"));
    }
});

//gia metakinhsh twn states
document.addEventListener("DOMContentLoaded", function () {
    let selectedState = null;
    let offsetX, offsetY, draggingState = null;
    const svg = document.getElementById("svg-area");

    //me click se katastash
    svg.addEventListener("click", function (event) {
        if (event.target.tagName === "circle") {
            selectedState = event.target;
            highlightState(selectedState); //ginetai highlight
        } else {    //apoepilegei to state
            if (selectedState) {
                selectedState.setAttribute("stroke", "var(--stroke-color)");
                selectedState.setAttribute("stroke-width", "2");
            }
            selectedState = null;
        }
    })

    //epilogh gia arxikh katastash
    document.getElementById("setInitialState").addEventListener("click", function () {
        if (selectedState) {
            setInitialState(selectedState);
        } else {
            alert(getTranslation("alertStateSelect"));
        }
    });

    //epilogh gia telikh katastash
    document.getElementById("setFinalState").addEventListener("click", function () {
        if (selectedState) {
            setFinalState(selectedState)
        } else {
            alert(getTranslation("alertStateSelect"));
        }
    })

    //epilogh gia allagh xrwmatos katastashs
    document.getElementById("colorState").addEventListener("click", function () {
        if (selectedState) {
            setColor(selectedState)
        } else {
            alert(getTranslation("alertStateSelect"));
        }
    })

    //an metakinithei state na kineitai kai to velaki arxikhs mazi
    svg.addEventListener("mousemove", function (event) {
        let movingState = document.querySelector(".state circle[dragging='true']");
        if (movingState) {
            let cx = parseFloat(movingState.getAttribute("cx"));
            let cy = parseFloat(movingState.getAttribute("cy"));
            let r = parseFloat(movingState.getAttribute("r"));

            let stateGroup = movingState.parentNode;
            let arrow = stateGroup.querySelector(".initial-arrow");

            if (arrow) {
                //update th thesh tou arrow
                let arrowSize = 10;
                let newPoints = `${cx - r - arrowSize},${cy} 
                                 ${cx - r - 2 * arrowSize},${cy - arrowSize} 
                                 ${cx - r - 2 * arrowSize},${cy + arrowSize}`;
                arrow.setAttribute("points", newPoints);
            }
        }
    });



    let dragTimeout;
    function startDrag(event) {
        if (event.target.tagName === "circle") {
            draggingState = event.target;
            const parentGroup = draggingState.parentNode;

            offsetX = event.clientX - draggingState.getAttribute("cx");
            offsetY = event.clientY - draggingState.getAttribute("cy");

            draggingState.setAttribute("dragging", "true");
        }
    }

    function drag(event) {
        if (dragTimeout) {
            cancelAnimationFrame(dragTimeout);
        }

        dragTimeout = requestAnimationFrame(() => {
            if (draggingState) {
                let svg = document.getElementById("svg-area");
                // bounds tou svg area
                let svgRect = svg.getBoundingClientRect();
                // aktina kuklou katastashs
                let r = parseFloat(draggingState.getAttribute("r"));

                let newX = event.clientX - offsetX;
                let newY = event.clientY - offsetY;

                //den mporei na vgei state ektos oriwn svg
                newX = Math.max(r, Math.min(svgRect.width - r, newX));
                newY = Math.max(r, Math.min(svgRect.height - r, newY));

                //update position tou state
                draggingState.setAttribute("cx", newX);
                draggingState.setAttribute("cy", newY);

                //update pos tou text mesa sto state
                const text = draggingState.nextSibling;
                if (text && text.tagName === "text") {
                    text.setAttribute("x", newX);
                    text.setAttribute("y", newY);
                }

                //update pos tou Initarrow (an uparxei)
                let stateGroup = draggingState.parentNode;
                let initArrow = stateGroup.querySelector(".initial-arrow");
                if (initArrow) {
                    let arrowSize = 10;
                    let newPoints = `${newX - r - arrowSize},${newY} 
                                 ${newX - r - 2 * arrowSize},${newY - arrowSize} 
                                 ${newX - r - 2 * arrowSize},${newY + arrowSize}`;
                    initArrow.setAttribute("points", newPoints);
                }

                //update pos tou Finalcircle (an uparxei)
                let finalCircle = stateGroup.querySelector(".final-circle");
                if (finalCircle) {
                    finalCircle.setAttribute("cx", newX);
                    finalCircle.setAttribute("cy", newY);
                }

                updateTransitionsForState(draggingState);
            }
        });
    }
    //ektos oriwn pinaka svg
    function endDrag() {
        if (dragTimeout) {
            cancelAnimationFrame(dragTimeout);
        }

        if (draggingState) {
            draggingState.removeAttribute("dragging");
        }
        draggingState = null;
    }

    svg.addEventListener("mousedown", startDrag);
    svg.addEventListener("mousemove", drag);
    svg.addEventListener("mouseup", endDrag);
    svg.addEventListener("mouseleave", endDrag);//an vgei to pontiki ektos oriwn svg
});

//gia metakinish metavashs mazi me to drag tou state
function updateTransitionsForState(state) {
    const stateId = state.getAttribute("data-id");
    const svg = document.getElementById("svg-area");
    const transitions = svg.querySelectorAll(".transition");
    const radius = parseFloat(state.getAttribute("r")) || 30;

    transitions.forEach(transition => {
        const fromId = transition.getAttribute("data-from");
        const toId = transition.getAttribute("data-to");
        const symbol = transition.getAttribute("data-symbol");
        const isSelfLoop = fromId === toId;

        if (fromId === stateId || toId === stateId) {
            const fromCircle = fromId === stateId ? state : document.querySelector(`circle[data-id="${fromId}"]`);
            const toCircle = toId === stateId ? state : document.querySelector(`circle[data-id="${toId}"]`);

            if (!fromCircle || !toCircle) return;

            if (isSelfLoop) {
                const x = parseFloat(fromCircle.getAttribute("cx"));
                const y = parseFloat(fromCircle.getAttribute("cy"));
                const loopRadius = radius + 20;
                const startX = x + radius * 0.6;
                const startY = y - radius;
                const endX = x - radius * 0.6;
                const endY = y - radius;
                const controlX1 = x + loopRadius;
                const controlY1 = y - (loopRadius * 1.4);
                const controlX2 = x - loopRadius;
                const controlY2 = y - (loopRadius * 1.4);
                transition.setAttribute("d", `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);

                const labelGroup = svg.querySelector(`.transition-label[data-transition-id="${fromId}-${toId}-${symbol}"]`);
                if (labelGroup) {
                    const text = labelGroup.querySelector("text");
                    const rect = labelGroup.querySelector("rect");

                    if (text && rect) {
                        text.setAttribute("x", x);
                        text.setAttribute("y", y - loopRadius * 1.3);

                        const bbox = text.getBBox();
                        rect.setAttribute("x", bbox.x - 4);
                        rect.setAttribute("y", bbox.y - 2);
                        rect.setAttribute("width", bbox.width + 8);
                        rect.setAttribute("height", bbox.height + 4);
                    }
                }

            } else {
                const fromX = parseFloat(fromCircle.getAttribute("cx"));
                const fromY = parseFloat(fromCircle.getAttribute("cy"));
                const toX = parseFloat(toCircle.getAttribute("cx"));
                const toY = parseFloat(toCircle.getAttribute("cy"));
                const dx = toX - fromX;
                const dy = toY - fromY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const offsetX = (dx / distance) * radius;
                const offsetY = (dy / distance) * radius;
                const startX = fromX + offsetX;
                const startY = fromY + offsetY;
                const endX = toX - offsetX;
                const endY = toY - offsetY;

                let curveDirection = 0;
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (startX < endX) {
                        curveDirection = -40;
                    } else {
                        curveDirection = 40;
                    }
                } else {
                    if (startY > endY) {
                        curveDirection = -40;
                    } else {
                        curveDirection = 40;
                    }
                }

                const controlX = (startX + endX) / 2 + (Math.abs(dx) < Math.abs(dy) ? curveDirection : 0);
                const controlY = (startY + endY) / 2 + (Math.abs(dx) > Math.abs(dy) ? curveDirection : 0);
                transition.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`);

                const labelGroup = svg.querySelector(`.transition-label[data-transition-id="${fromId}-${toId}-${symbol}"]`);
                if (labelGroup) {
                    const text = labelGroup.querySelector("text");
                    const rect = labelGroup.querySelector("rect");

                    if (text && rect) {
                        text.setAttribute("x", controlX);
                        text.setAttribute("y", controlY - 1);

                        const bbox = text.getBBox();
                        rect.setAttribute("x", bbox.x - 4);
                        rect.setAttribute("y", bbox.y - 2);
                        rect.setAttribute("width", bbox.width + 8);
                        rect.setAttribute("height", bbox.height + 4);
                    }
                }
            }
        }
    });
}

//metakineitai kai to text ths metavashs
function findTransitionText(symbol, fromId, toId) {
    const svg = document.getElementById("svg-area");
    const transitionId = `${fromId}-${toId}-${symbol}`;

    //me vash to id
    const exactMatch = svg.querySelector(`.transition-text[data-transition-id="${transitionId}"]`);
    if (exactMatch) {
        return exactMatch;
    }
}

//highlight h epilegmenh katastash
function highlightState(state) {
    //afairei to highlight ths prohgoumenhs epilegmenhs 
    document.querySelectorAll(".state circle").forEach(circle => {
        circle.setAttribute("stroke", "var(--stroke-color)");
        circle.setAttribute("stroke-width", "2");
        circle.classList.remove("selected-state"); //afairw kai to class 
    });

    //highlight me mple outline
    state.setAttribute("stroke", "var(--highlight-color)");
    state.classList.add("selected-state");
    state.setAttribute("stroke-width", "3");
}

//orismos arxikhs katastashs
function setInitialState(state) {
    const stateGroup = state.parentNode;

    //afairei thn prohgoumenh arxikh katastash
    let existingInitialState = document.querySelector(".initial-arrow");
    if (existingInitialState) {
        const oldInitialGroup = existingInitialState.parentNode;
        oldInitialGroup.removeAttribute("data-initial");
        existingInitialState.remove();
    }

    let cx = parseFloat(state.getAttribute("cx"));
    let cy = parseFloat(state.getAttribute("cy"));
    let r = parseFloat(state.getAttribute("r"));

    let arrowSize = 10;
    let trianglePoints = `${cx - r - arrowSize},${cy} 
                          ${cx - r - 2 * arrowSize},${cy - arrowSize} 
                          ${cx - r - 2 * arrowSize},${cy + arrowSize}`;


    let initialArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    initialArrow.setAttribute("points", trianglePoints);
    initialArrow.setAttribute("fill", "var(--fill-color)");
    initialArrow.setAttribute("class", "initial-arrow");
    initialArrow.setAttribute("pointer-events", "none");

    //prosthetei to arrow sto group
    stateGroup.prepend(initialArrow);

    stateGroup.setAttribute("data-initial", "true");
}

//orismos telikhs katastashs (pollaples)
function setFinalState(state) {
    const stateGroup = state.parentNode;


    //an einai hdh telikh afairese ton extra kuklo
    let existingFinalCircle = stateGroup.querySelector(".final-circle");
    if (existingFinalCircle) {
        existingFinalCircle.remove();
        stateGroup.removeAttribute("data-final")
        return;
    }

    let cx = parseFloat(state.getAttribute("cx"));
    let cy = parseFloat(state.getAttribute("cy"));
    let r = parseFloat(state.getAttribute("r"));

    //akoma enas kuklos sth telikh katastash
    let finalCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    finalCircle.setAttribute("cx", cx);
    finalCircle.setAttribute("cy", cy);
    finalCircle.setAttribute("r", r + 6);
    finalCircle.setAttribute("fill", "none");
    finalCircle.setAttribute("stroke", "var(--stroke-color)");
    finalCircle.setAttribute("stroke-width", "2");
    finalCircle.setAttribute("class", "final-circle");
    finalCircle.setAttribute("pointer-events", "none"); //den to thelw selectable

    //add kai sto group
    stateGroup.appendChild(finalCircle);
    stateGroup.setAttribute("data-final", "true");
}

// lista me xrwmata
const colors = ["yellow", "lightgreen", "cyan", "pink", "gray", "red", "orange"];
let stateColors = new Map();    //color index

function setColor(state) {
    let currentIndex = stateColors.get(state) || 0; //pairnei to index tou colors
    state.setAttribute("fill", colors[currentIndex]); //xrwmatizei to state

    //update to index kai loop apo thn arxh otan teleiwsei
    stateColors.set(state, (currentIndex + 1) % colors.length);
}

// ACTIONS -- ACTIONS -- ACTIONS

// CLEAR SVG AREA
function clearSvgArea() {
    const svg = document.getElementById("svg-area");
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    //clear kai ta inputs/results ths dokimhs
    document.getElementById("testStrings").value = "";
    document.getElementById("testResults").innerHTML = "<p>Test Results:</p>";
}

document.getElementById("clearSvgArea").addEventListener("click", function () {
    let text = getTranslation("alertClear");
    //me ok apo xrhsth
    if (confirm(text)) {
        clearSvgArea();
    }
});


function showNotification(message, color) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

document.getElementById("dfa").addEventListener("change", function () {
    text = getTranslation("notificationDFA")
    showNotification(text, "gray");
});

document.getElementById("nfa").addEventListener("change", function () {
    text = getTranslation("notificationNFA")
    showNotification(text, "gray");
});

// TRANSITIONS -- TRANSITIONS -- TRANSITIONS

document.getElementById("addTransition").addEventListener("click", () => {
    let selectedStates = [];
    alert(getTranslation("alertTransitionAdd"));

    function handleStateClick(event) {
        const clickedCircle = event.target.closest('.state circle');
        if (!clickedCircle) return;

        //epilogh mono katastasewn kai oxi text
        if (selectedStates.length < 2 && !selectedStates.includes(clickedCircle)) {
            selectedStates.push(clickedCircle);
            highlightState(clickedCircle);
        }

        if (selectedStates.length === 2) {
            document.querySelectorAll(".state").forEach(state => {
                state.removeEventListener("click", handleStateClick);
            });

            let transitionLabel = prompt(getTranslation("promptEnterTransitionLabel"));

            const automatonType = document.querySelector('input[name="automaton"]:checked')?.value || "DFA";

            //me epilogh dfa den epitrepontai kenes metavaseis kai metavaseis me idio sumvolo
            if (automatonType === "DFA") {
                if (!transitionLabel) {
                    alert(getTranslation("alertEmptyTransitions"));
                    return;
                }

                const fromId = selectedStates[0].getAttribute("data-id");
                const outgoing = document.querySelectorAll(`.transition[data-from="${fromId}"]`);
                //elegxos an to neo sumvolo uparxei hdh
                for (const t of outgoing) {
                    const symbols = t.getAttribute("data-symbol").split(",").map(s => s.trim());
                    if (symbols.includes(transitionLabel.trim())) {
                        alert(getTranslation("alertSameSymbolTransition"));
                        return;
                    }
                }
            }

            if (transitionLabel !== null) {
                const symbol = transitionLabel.trim() === "" ? "ε" : transitionLabel;
                addTransition(selectedStates[0], selectedStates[1], symbol);
            }

            selectedStates.forEach(state => {
                state.setAttribute("stroke", "var(--stroke-color)");
                state.setAttribute("stroke-width", "2");
            });
            selectedStates = [];
        }
    }

    document.querySelectorAll(".state").forEach(state => {
        state.addEventListener("click", handleStateClick);
    });
});


function addTransition(fromState, toState, label) {
    let svg = document.getElementById("svg-area");
    label = label.trim();
    const fromId = fromState.getAttribute("data-id");
    const toId = toState.getAttribute("data-id");

    //an uparxei hdh metavash se auta ta states
    const existingPath = svg.querySelector(
        `.transition[data-from="${fromId}"][data-to="${toId}"]`
    );

    //den dhmiourgw nea alla prosthetw mono to symbol sthn hdh uparxousa metavash
    if (existingPath) {
        let existingLabel = existingPath.getAttribute("data-symbol");
        let symbols = existingLabel.split(",").map(s => s.trim());

        if (!symbols.includes(label)) {
            symbols.push(label);
            const updatedLabel = symbols.join(",");

            //ananewnetai to label ths metavashs
            existingPath.setAttribute("data-symbol", updatedLabel);

            const oldId = `${fromId}-${toId}-${existingLabel}`; //vriskw to palio id
            const newId = `${fromId}-${toId}-${updatedLabel}`;

            //vriskw to svg group pou periexei to rect me to label 
            const labelGroup = svg.querySelector(`g.transition-label[data-transition-id="${oldId}"]`);
            const textElement = labelGroup?.querySelector("text");
            const rect = labelGroup?.querySelector("rect");

            if (labelGroup && textElement && rect) {
                textElement.textContent = updatedLabel;
                textElement.setAttribute("x", textElement.getAttribute("x"));

                //ananewnei dynamika to megethos tou rect
                requestAnimationFrame(() => {
                    const bbox = textElement.getBBox();
                    rect.setAttribute("x", bbox.x - 4);
                    rect.setAttribute("y", bbox.y - 2);
                    rect.setAttribute("width", bbox.width + 8);
                    rect.setAttribute("height", bbox.height + 4);
                });
                //enhmerwsh tou id tou transition
                textElement.setAttribute("data-transition-id", newId);
                labelGroup.setAttribute("data-transition-id", newId);
            }
        }
        return;
    }

    let fromX = parseFloat(fromState.getAttribute("cx"));
    let fromY = parseFloat(fromState.getAttribute("cy"));
    let toX = parseFloat(toState.getAttribute("cx"));
    let toY = parseFloat(toState.getAttribute("cy"));
    let radius = parseFloat(fromState.getAttribute("r")) || 30;

    let dx = toX - fromX;
    let dy = toY - fromY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    let offsetX = (dx / distance) * radius;
    let offsetY = (dy / distance) * radius;

    let startX = fromX + offsetX;
    let startY = fromY + offsetY;
    let endX = toX - offsetX;
    let endY = toY - offsetY;

    let defs = svg.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);
    }

    if (!document.getElementById("arrowhead")) {
        let marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "8");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "6");
        marker.setAttribute("markerHeight", "6");
        marker.setAttribute("orient", "auto-start-reverse");

        let arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        arrow.setAttribute("fill", "var(--fill-color)");
        marker.appendChild(arrow);
        defs.appendChild(marker);
    }

    let curveDirection = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
        //an metavash pros ta deksia/aristera
        if (startX < endX) {
            startY -= 10;
            endY -= 10;
            curveDirection = -40;
        } else {
            startY += 10;
            endY += 10;
            curveDirection = 40;
        }
    } else {
        //an metavash pros ta panw/katw
        if (startY > endY) {
            curveDirection = -40;
            startX -= 10;
            endX -= 10;
        } else {
            curveDirection = 40;
            startX += 10;
            endX += 10;
        }
    }

    //upologizei kampules gia metavaseis orizonties & kathetes
    let controlX = (startX + endX) / 2 + (Math.abs(dx) < Math.abs(dy) ? curveDirection : 0);
    let controlY = (startY + endY) / 2 + (Math.abs(dx) > Math.abs(dy) ? curveDirection : 0);
    const displayLabel = label === "" ? "ε (empty)" : label;    //keno sumvolo

    //kampulwth metavash
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`);
    path.setAttribute("stroke", "var(--stroke-color)");
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("marker-end", "url(#arrowhead)");
    path.setAttribute("class", "transition");
    path.setAttribute("data-from", fromId);
    path.setAttribute("data-to", toId);
    path.setAttribute("data-symbol", label);

    svg.appendChild(path);

    //etiketa ths metavashs
    let labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.setAttribute("class", "transition-label");
    labelGroup.setAttribute("data-transition-id", `${fromId}-${toId}-${label}`);

    let tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tempText.setAttribute("x", controlX);
    tempText.setAttribute("y", controlY - 1);
    tempText.setAttribute("font-size", "14");
    tempText.setAttribute("text-anchor", "middle");
    tempText.setAttribute("class", "transition-text");
    tempText.textContent = displayLabel;

    labelGroup.appendChild(tempText);
    svg.appendChild(labelGroup);

    let bbox = tempText.getBBox();
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", bbox.x - 4);
    rect.setAttribute("y", bbox.y - 2);
    rect.setAttribute("width", bbox.width + 8);
    rect.setAttribute("height", bbox.height + 4);
    rect.setAttribute("class", "transition-label-bg");
    rect.setAttribute("pointer-events", "none");

    labelGroup.insertBefore(rect, tempText);
    svg.appendChild(labelGroup);

    //epileksimes metavaseis
    path.addEventListener("click", function (event) {
        event.stopPropagation(); //den to kanei deselect kateutheian me epomeno click
        selectTransition(path, tempText);
    });
}

// gia transition sto idio state
document.getElementById("selfLoopTransition").addEventListener("click", () => {
    alert(getTranslation("alertSelfLoop"));

    const automatonType = document.querySelector('input[name="automaton"]:checked')?.value || "DFA";

    function handleStateClick(event) {
        const selectedState = event.target.closest("g.state")?.querySelector("circle");
        if (!selectedState) return;

        const fromId = selectedState.getAttribute("data-id");
        let transitionLabel = prompt(getTranslation("promptEnterTransitionLabel"));

        //oi elegxoi gia metavaseis DFA
        if (automatonType === "DFA") {
            if (!transitionLabel) {
                alert(getTranslation("alertEmptyTransitions"));
                return;
            }
            const duplicate = document.querySelector(`.transition[data-from="${fromId}"][data-symbol="${transitionLabel}"]`);
            if (duplicate) {
                alert(getTranslation("alertSameSymbolTransition"))
                return;
            }
        }

        if (transitionLabel !== null) {
            drawSelfLoop(selectedState, transitionLabel);
        }

        cleanupListeners();
    }

    function handleCancelClick(event) {
        //an den pathsw state akurwnw ton listener
        if (!event.target.closest("g.state")) {
            cleanupListeners();
        }
    }

    function cleanupListeners() {
        document.querySelectorAll(".state").forEach(state => {
            state.removeEventListener("click", handleStateClick);
        });
        document.getElementById("svg-area").removeEventListener("click", handleCancelClick);
    }

    document.querySelectorAll(".state").forEach(state => {
        state.removeEventListener("click", handleStateClick);
        state.addEventListener("click", handleStateClick);
    });
    document.getElementById("svg-area").addEventListener("click", handleCancelClick);
});

// sxediazei th metavash sto idio state
function drawSelfLoop(state, label) {
    let svg = document.getElementById("svg-area");

    let x = parseFloat(state.getAttribute("cx"));
    let y = parseFloat(state.getAttribute("cy"));
    let radius = parseFloat(state.getAttribute("r")) || 30;
    let loopRadius = radius + 20;

    let startX = x + radius * 0.6;
    let startY = y - radius;
    let endX = x - radius * 0.6;
    let endY = y - radius;

    let controlX1 = x + loopRadius;
    let controlY1 = y - (loopRadius * 1.4);
    let controlX2 = x - loopRadius;
    let controlY2 = y - (loopRadius * 1.4);

    let defs = svg.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);
    }

    let markerId = "arrowhead-" + Date.now();   //kathe arrowhead kai allo id based sto date
    let marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", markerId);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "5");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto");

    let arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 Z");
    arrow.setAttribute("fill", "var(--fill-color)");

    marker.appendChild(arrow);
    defs.appendChild(marker);

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);
    path.setAttribute("stroke", "var(--stroke-color)");
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("marker-end", `url(#${markerId})`);

    const stateId = state.getAttribute("data-id");
    let parentGroup = state.closest("g");
    path.setAttribute("class", "transition");
    path.setAttribute("data-from", stateId);
    path.setAttribute("data-to", stateId);
    path.setAttribute("data-symbol", label);


    //etiketa metavashs
    let labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.setAttribute("class", "transition-label");
    labelGroup.setAttribute("data-transition-id", `${stateId}-${stateId}-${label}`);

    let tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tempText.setAttribute("x", x);
    tempText.setAttribute("y", y - loopRadius * 1.3);
    tempText.setAttribute("font-size", "14");
    tempText.setAttribute("text-anchor", "middle");
    tempText.setAttribute("class", "transition-text");
    tempText.textContent = label;

    labelGroup.appendChild(tempText);
    svg.appendChild(labelGroup);

    let bbox = tempText.getBBox();
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", bbox.x - 4);
    rect.setAttribute("y", bbox.y - 2);
    rect.setAttribute("width", bbox.width + 8);
    rect.setAttribute("height", bbox.height + 4);
    rect.setAttribute("class", "transition-label-bg");
    rect.setAttribute("pointer-events", "none");

    labelGroup.insertBefore(rect, tempText);

    if (parentGroup) {
        parentGroup.appendChild(labelGroup);
        parentGroup.appendChild(path);
    } else {
        svg.appendChild(labelGroup);
        svg.appendChild(path);
    }
    //klash gia self loops
    //gia na exoun idio behavior me tis kanonikes metavaseis
    path.classList.add("self-loop");
    path.addEventListener("click", function (event) {
        event.stopPropagation();
        selectTransition(path, tempText);
    });
}

let selectedTransition = null;

//highlight metavash me click
function selectTransition(path, text) {
    //deselect prohgoumenes epilegmenes
    if (selectedTransition) {
        selectedTransition.path.setAttribute("stroke", "var(--stroke-color)");
        selectedTransition.text.setAttribute("fill", "var(--fill-color)");
    }
    //kai deselect tuxon highlighted states
    const prevSelectedState = document.querySelector(".state circle[stroke='var(--highlight-color)']")
    if (prevSelectedState) {
        prevSelectedState.classList.remove("selected-state");
        prevSelectedState.setAttribute("stroke", "var(--stroke-color)");
        prevSelectedState.setAttribute("stroke-width", "2");
    }

    path.setAttribute("stroke", "var(--highlight-color)");
    text.setAttribute("fill", "var(--highlight-color)");

    const from = path.getAttribute("data-from");
    const to = path.getAttribute("data-to");
    const symbol = path.getAttribute("data-symbol");

    selectedTransition = { path, text, from, to, symbol };
}

//reset highlight sthn apoepilogh
document.getElementById("svg-area").addEventListener("click", function (event) {
    if (selectedTransition) {
        //an epilegei otidhpote ektos metavashs h self loop
        if (!event.target.classList.contains("transition") && !event.target.classList.contains("self-loop")) {
            selectedTransition.path.setAttribute("stroke", "var(--stroke-color)");
            selectedTransition.text.setAttribute("fill", "var(--fill-color)");
            selectedTransition = null;
        }
    }
});


// epeksergasia timhs metavashs
document.getElementById("editTransition").addEventListener("click", () => {
    if (selectedTransition && selectedTransition.text) {
        let oldLabel = selectedTransition.symbol;
        let newLabel = prompt("Enter new transition label:", oldLabel);

        if (newLabel !== null) {
            const updatedLabel = newLabel.trim();
            const automatonType = document.querySelector('input[name="automaton"]:checked')?.value || "DFA";

            if (automatonType === "DFA") {
                //xwrise to string se kathe sumvolo ksexwrista
                const newSymbols = updatedLabel
                    .split(",")
                    .map(s => s.trim())
                    .filter(s => s !== "");

                //den epitrepetai keno se DFA
                if (newSymbols.length === 0) {
                    alert(getTranslation("alertEmptyTransitions"));
                    return;
                }

                //idia sumvola sto idio label den epitrepontai
                const hasInternalDups = newSymbols.some((s, i) => newSymbols.indexOf(s) !== i);
                if (hasInternalDups) {
                    alert(getTranslation("alertDuplicateInLabel"));
                    return;
                }

                //den epitrepontai sumvola pou hdh ekserxontai apo thn trexousa katastash
                const fromId = selectedTransition.from;
                const outgoing = document.querySelectorAll(`.transition[data-from="${fromId}"]`);

                for (const t of outgoing) {
                    if (t === selectedTransition.path) continue; //trexousa metavash opote continue
                    const existingSyms = t.getAttribute("data-symbol")
                        .split(",")
                        .map(s => s.trim())
                        .filter(s => s !== "");
                    //elegxei gia pollapla sumvola se metavaseis px 0, 1, 2 klp
                    if (newSymbols.some(sym => existingSyms.includes(sym))) {
                        alert(getTranslation("alertSameSymbolTransition"));
                        return;
                    }
                }
            }

            const displayText = updatedLabel === "" ? "ε" : updatedLabel;
            selectedTransition.text.textContent = displayText;
            selectedTransition.path.setAttribute("data-symbol", updatedLabel);
            selectedTransition.text.setAttribute(
                "data-transition-id",
                `${selectedTransition.from}-${selectedTransition.to}-${updatedLabel}`
            );

            const labelGroup = selectedTransition.text.closest("g.transition-label");
            if (labelGroup) {
                labelGroup.setAttribute("data-transition-id", `${selectedTransition.from}-${selectedTransition.to}-${updatedLabel}`);
                const rect = labelGroup.querySelector("rect");
                const bbox = selectedTransition.text.getBBox();

                if (rect) {
                    rect.setAttribute("x", bbox.x - 4);
                    rect.setAttribute("y", bbox.y - 2);
                    rect.setAttribute("width", bbox.width + 8);
                    rect.setAttribute("height", bbox.height + 4);
                }
            }
            selectedTransition.symbol = updatedLabel;
        }
    } else {
        alert(getTranslation("alertTransitionSelect"));
    }
});

// afairesh metavashs
document.getElementById("removeTransition").addEventListener("click", () => {
    if (selectedTransition) {
        selectedTransition.path.remove();
        const labelGroup = document.querySelector(`.transition-label[data-transition-id="${selectedTransition.from}-${selectedTransition.to}-${selectedTransition.symbol}"]`);
        if (labelGroup) {
            labelGroup.remove();
        }

        selectedTransition = null;// den uparxei epilegmenh pleon
    } else {
        alert(getTranslation("alertTransitionSelect"));
    }
});

//gia metafrash
document.addEventListener("DOMContentLoaded", () => {
    const langToggle = document.getElementById("lang-toggle");
    const langIcon = document.getElementById("lang-icon");
    function loadTranslations(lang) {
        fetch("translations.json")
            .then(response => response.json())
            .then(translations => {
                if (translations[lang]) {
                    currentTranslations = translations[lang];
                    applyTranslations(translations[lang]);
                } else {
                    console.error("Language not found:", lang);
                }
            })
            .catch(error => console.error("Error:", error));
    }
    function applyTranslations(translations) {
        document.querySelectorAll("[id]").forEach(element => {
            const key = element.id;
            if (key === "guestInfo" && translations[key]) {
                element.innerHTML = translations[key];  //gia <strong> html
            } else if (translations[key]) {
                element.textContent = translations[key];
            }
            //translate ta placeholders gia ta input fields
            if (element.placeholder !== undefined && translations[`${key}Placeholder`]) {
                element.placeholder = translations[`${key}Placeholder`];
            }
            //kai ta tooltips twn buttons
            if (element.title !== undefined && translations[`${key}Title`]) {
                element.title = translations[`${key}Title`];
            }
            //gia ta checkboxes
            if (translations[`${key}Label`]) {
                element.textContent = translations[`${key}Label`];
            }
        });
    }
    function switchLanguage(lang) {
        localStorage.setItem("selectedLanguage", lang);
        langIcon.src = lang === "en" ? "images/greece.png" : "images/united-kingdom.png";
        loadTranslations(lang);
    }

    function getTranslation(key) {
        return currentTranslations[key] || key;
    }

    //agglika by default
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    switchLanguage(savedLanguage);

    langToggle.addEventListener("click", () => {
        const currentLang = localStorage.getItem("selectedLanguage") || "en";
        const newLang = currentLang === "en" ? "el" : "en";
        switchLanguage(newLang);
    });

    window.getTranslation = getTranslation;

    // click se keno tou svg = apoepilogh olwn
    document.getElementById("svg-area").addEventListener("click", (event) => {
        const isState = event.target.closest("g.state");
        const isTransition = event.target.classList.contains("transition") || event.target.classList.contains("transition-text");

        if (!isState && !isTransition) {
            //deselect katastashs
            document.querySelectorAll(".state circle").forEach(circle => {
                circle.setAttribute("stroke", "var(--stroke-color)");
                circle.setAttribute("stroke-width", "2");
                circle.classList.remove("selected-state");
            });

            //deselect kai metavashs
            if (window.selectedTransition) {
                window.selectedTransition.path.setAttribute("stroke", "var(--stroke-color)");
                window.selectedTransition.text.setAttribute("fill", "var(--fill-color)");
                window.selectedTransition = null;
            }
        }
    });
});

//dark/light theme
const themeBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

themeBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    themeIcon.src = isDark ? "images/sun.png" : "images/half-moon.png";
});

document.getElementById('testFA').addEventListener('click', () => {
    const rawInput = document.getElementById('testStrings').value;
    const inputs = rawInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== undefined);


    const automaton = getAutomatonData(); //pairnei ta stoixeia tou FA

    if (!automaton.states.length || !automaton.transitions.length) {
        alert(getTranslation("alertEmptyAutomaton"));
        return;
    }

    const hasInitial = automaton.states.some(s => s.isInitial);
    const hasFinal = automaton.states.some(s => s.isFinal);

    if (!hasInitial) {
        alert(getTranslation("alertNoInitialState"));
        return;
    }

    if (!hasFinal) {
        alert(getTranslation("alertNoFinalState"));
        return;
    }

    const expandedTransitions = [];
    //se periptwsh pou uparxoun >1 sumvola se mia metavash tote spane prin to test
    automaton.transitions.forEach(t => {
        const symbols = t.symbol.split(',');
        symbols.forEach(sym => {
            //gia 0,1 ginontai mia gia 0 kai mia gia 1
            expandedTransitions.push({
                from: t.from,
                to: t.to,
                symbol: sym.trim() === "ε" ? "" : sym.trim()
            });
        });
    });
    automaton.transitions = expandedTransitions;

    fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automaton, accepted: inputs, includeEmptyString: true })
    })
        .then(res => res.json())
        .then(data => {
            const results = data.results;
            let output = '';

            for (const input of Object.keys(results)) {
                const isAccepted = results[input];
                let status;
                //dexetai eisodo keno gia elegxo
                let displayInput = input === "" ? "ε" : input;

                status = isAccepted ? getTranslation("accepted") : getTranslation("rejected");

                output += `<li class="test-row ${isAccepted ? "accepted" : "rejected"}">${displayInput} → ${status}</li>`;
            }

            document.getElementById('testResults').innerHTML = `
                <p>${getTranslation("testResultsHeading")}</p>
                <ul class="results-list">${output}</ul>
            `;
        })
        .catch(err => {
            console.error("Error during simulation:", err);
            alert(getTranslation("alertSimulationFail"))
        });
});

//sullegei ta stoixeia tou sxediasmenou automatou
function getAutomatonData() {
    const states = [];
    const transitions = [];
    const automatonType = document.querySelector('input[name="automaton"]:checked')?.value || "DFA";

    //attributes twn katastasewn
    document.querySelectorAll('#svg-area g.state').forEach(stateGroup => {
        const circle = stateGroup.querySelector('circle');
        const id = circle.getAttribute('data-id');
        const x = parseFloat(circle.getAttribute('cx'));
        const y = parseFloat(circle.getAttribute('cy'));
        const color = circle.getAttribute('fill');
        const isInitial = stateGroup.getAttribute('data-initial') === 'true';
        const isFinal = stateGroup.getAttribute('data-final') === 'true';
        states.push({ id, x, y, color, isInitial, isFinal });
    });

    //kai twn metavasewn
    document.querySelectorAll('#svg-area .transition').forEach(t => {
        const from = t.getAttribute('data-from');
        const to = t.getAttribute('data-to');
        let symbol = t.getAttribute('data-symbol');

        //an dwthei e tote to krataei ws keno sumvolo
        if (symbol === "ε") {
            symbol = "";
        }

        transitions.push({ from, to, symbol });
    });

    return { type: automatonType, states, transitions };
}

document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault(); //na mhn kanei refresh
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;
    const isSignIn = document.getElementById("signInTab").classList.contains("active");
    const endpoint = isSignIn ? "/auth/login" : "/auth/register";

    try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || getTranslation("somethingWentWrong"));
            return;
        }

        if (isSignIn) { //kartela sundeshs sto modal
            localStorage.setItem("userEmail", email);
            showUserModal(email); //emfanizei to user modal me logout
            document.getElementById("auth-modal").classList.add("hidden"); // kruvei to modal me login/register
        } else {    //kartela eggrafhs
            alert(getTranslation("registrationSuccess"));
        }

    } catch (error) {
        console.error("Auth error:", error);
        alert(getTranslation("failedToConnect"));
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const authModal = document.getElementById("auth-modal");
    const userModal = document.getElementById("user-modal");
    const authButton = document.getElementById("authButton");
    const signInTab = document.getElementById("signInTab");
    const signUpTab = document.getElementById("signUpTab");
    const submitButton = document.getElementById("submit-auth");

    authButton?.addEventListener("click", () => {
        const userEmail = localStorage.getItem("userEmail"); //save sto localstorage to email

        if (userEmail) {    //tote einai sundedemenos o user
            showUserModal(userEmail);
        } else {
            authModal.classList.remove("hidden");
        }
    });

    //apokrupsh modal me login
    document.getElementById("closeModalButton")?.addEventListener("click", () => {
        authModal.classList.add("hidden");
    });

    //apokrupsh modal me logout
    document.getElementById("closeUserButton")?.addEventListener("click", () => {
        hideUserModal();
    });

    //kleisimo modal me click ektos tou parathurou
    window.addEventListener("click", (e) => {
        document.querySelectorAll(".modal").forEach((modal) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });
    });

    //enallagh
    signInTab?.addEventListener("click", () => setAuthMode("signin"));
    signUpTab?.addEventListener("click", () => setAuthMode("signup"));

    function setAuthMode(mode) {
        const isSignIn = mode === "signin";
        signInTab.classList.toggle("active", isSignIn);
        signUpTab.classList.toggle("active", !isSignIn);
        submitButton.textContent = getTranslation(isSignIn ? "signInTab" : "signUpTab");
    }
});

//emfanish modal me info kai logout
function showUserModal(email) {
    const modal = document.getElementById("user-modal");
    modal.classList.remove("hidden");

    const loggedInText = document.getElementById("loggedInText");
    const userEmailText = document.getElementById("userEmailText");

    if (loggedInText) loggedInText.textContent = getTranslation("loggedInText");
    if (userEmailText) userEmailText.textContent = " " + email;
}

function hideUserModal() {
    document.getElementById("user-modal").classList.add("hidden");
}

//logout
document.getElementById("loggout")?.addEventListener("click", () => {
    localStorage.removeItem("userEmail"); //afairei to email apo to storage
    hideUserModal();
});

//reset to scrollbar sthn arxikh tou thesh
window.addEventListener('load', () => {
    const container = document.getElementById('svg-container');
    container.scrollLeft = 0;
});