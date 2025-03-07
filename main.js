// STATES -- STATES -- STATES
document.getElementById("addState").addEventListener("click", function () {
    const svg = document.getElementById("svg-area");
    let stateCount = svg.getElementsByClassName("state").length;
    let stateId = `q${stateCount}`; //arithmhsh katastasewn

    const posX = 100 + stateCount * 100;
    const posY = 200;

    //dhmiourgia group gia kathe state me onoma
    const stateGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    stateGroup.setAttribute("id", `state-${stateId}`);
    stateGroup.setAttribute("class", "state");

    //dhmiourgia katastashs
    //<circle cx="100" cy="200" r="30" stroke="black" stroke-width="2" fill="red" />
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", posX);
    circle.setAttribute("cy", posY);
    circle.setAttribute("r", "30");
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", "red");

    //onoma ths katastashs
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", posX - 10);
    text.setAttribute("y", posY + 5);
    text.setAttribute("font-size", "18");
    text.setAttribute("fill", "black");
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
    });

    //epilogh gia arxikh katastash
    document.getElementById("setInitialState").addEventListener("click", function () {
        if (selectedState) {
            setInitialState(selectedState);
        } else {
            alert("Please select a state first!");
        }
    });

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
            let newX = event.clientX - offsetX;
            let newY = event.clientY - offsetY;

            //update position tou state
            draggingState.setAttribute("cx", newX);
            draggingState.setAttribute("cy", newY);

            //update pos tou text mesa sto state
            const text = draggingState.nextSibling;
            if (text && text.tagName === "text") {
                text.setAttribute("x", newX - 10);
                text.setAttribute("y", newY + 5);
            }

            //update pos tou Initarrow
            let stateGroup = draggingState.parentNode;
            let arrow = stateGroup.querySelector(".initial-arrow");
            if (arrow) {
                let r = parseFloat(draggingState.getAttribute("r"));
                let arrowSize = 10;
                let newPoints = `${newX - r - arrowSize},${newY} 
                                 ${newX - r - 2 * arrowSize},${newY - arrowSize} 
                                 ${newX - r - 2 * arrowSize},${newY + arrowSize}`;
                arrow.setAttribute("points", newPoints);
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
