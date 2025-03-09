// STATES -- STATES -- STATES
document.getElementById("addState").addEventListener("click", function () {
    const svg = document.getElementById("svg-area");
    let stateCount = svg.getElementsByClassName("state").length;
    let stateId = `q${stateCount}`; //arithmhsh katastasewn
    let svgRect = svg.getBoundingClientRect(); //bounds tou svg

    const posX = Math.min(50 + stateCount * 80, svgRect.width - 40);
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
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", "orange");

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

//delete thn teleutaia katastash
document.getElementById("removeState").addEventListener("click", function () {
    const svg = document.getElementById("svg-area");
    let states = svg.getElementsByClassName("state");

    if (states.length > 0) {
        svg.removeChild(states[states.length - 1]);
    } else {
        alert("No more states to remove!");
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
                selectedState.setAttribute("stroke", "black");
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
            alert("Please select a state first!");
        }
    });

    //epilogh gia telikh katastash
    document.getElementById("setFinalState").addEventListener("click", function () {
        if (selectedState) {
            setFinalState(selectedState)
        } else {
            alert("Please select a state first!")
        }
    })

    //epilogh gia allagh xrwmatos katastashs
    document.getElementById("colorState").addEventListener("click", function () {
        if (selectedState) {
            setColor(selectedState)
        } else {
            alert("Please select a state first!")
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
                text.setAttribute("x", newX - 10);
                text.setAttribute("y", newY + 5);
            }

            //update pos tou Initarrow (an uparxei)
            let stateGroup = draggingState.parentNode;
            let initArrow = stateGroup.querySelector(".initial-arrow");
            if (initArrow) {
                let r = parseFloat(draggingState.getAttribute("r"));
                let arrowSize = 10;
                let newPoints = `${newX - r - arrowSize},${newY} 
                                 ${newX - r - 2 * arrowSize},${newY - arrowSize} 
                                 ${newX - r - 2 * arrowSize},${newY + arrowSize}`;
                initArrow.setAttribute("points", newPoints);
            }

            //update pos tou Finalcircle (an uparxei)
            let finalCircle = stateGroup.querySelector(".final-circle");
            if (finalCircle) {
                finalCircle.setAttribute("cx", newX)
                finalCircle.setAttribute("cy", newY)
            }
        }
    }
    //ektos oriwn pinaka svg
    function endDrag() {
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

//highlight h epilegmenh katastash
function highlightState(state) {
    //afairei to highlight ths prohgoumenhs epilegmenhs 
    document.querySelectorAll(".state circle").forEach(circle => {
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
    });

    //highlight me mple outline
    state.setAttribute("stroke", "blue");
    state.setAttribute("stroke-width", "3");
}

//orismos arxikhs katastashs
function setInitialState(state) {
    const stateGroup = state.parentNode;

    //afairei thn prohgoumenh arxikh katastash
    let existingInitialState = document.querySelector(".initial-arrow");
    if (existingInitialState) {
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
    initialArrow.setAttribute("fill", "black");
    initialArrow.setAttribute("class", "initial-arrow");

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
    finalCircle.setAttribute("stroke", "black");
    finalCircle.setAttribute("stroke-width", "2");
    finalCircle.setAttribute("class", "final-circle");

    //add kai sto group
    stateGroup.appendChild(finalCircle);
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

// Clear svg-area
document.getElementById("clearSvgArea").addEventListener("click", function () {
    let text = "Are you sure you want to clear the board?"
    // me ok apo user svhnei ta panta apo ton pinaka
    if (confirm(text) == true) {
        const svg = document.getElementById("svg-area");
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }
});
