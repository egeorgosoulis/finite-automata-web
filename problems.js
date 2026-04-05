// arxeio gia ta provlhmata pros epilush sto learning section

function scrollToCanvas() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document.getElementById("dfa-learning").addEventListener("change", () => {
  setAutomatonMode("DFA");
});

document.getElementById("nfa-learning").addEventListener("change", () => {
  setAutomatonMode("NFA");
});

// ta radio buttons (panw) akolouthoun tis katw epiloges gia tupo automatwn
function setAutomatonMode(type) {
  const dfaRadio = document.getElementById("dfa");
  const nfaRadio = document.getElementById("nfa");

  if (type === "DFA") {
    dfaRadio.checked = true;
    dfaRadio.dispatchEvent(new Event("change"));
  } else {
    nfaRadio.checked = true;
    nfaRadio.dispatchEvent(new Event("change"));
  }
}

document
  .querySelectorAll("#problem-easy-btn, #problem-medium-btn, #problem-hard-btn")
  .forEach((button) => {
    button.addEventListener("click", () => {
      scrollToCanvas();
    });
  });
