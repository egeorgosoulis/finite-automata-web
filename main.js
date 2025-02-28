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

