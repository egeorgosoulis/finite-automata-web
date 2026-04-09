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

// deixnei se poio mode vriskomaste (playground/problem solving)
let currentMode = "playground";
let currentProblemId = null;

function setMode(mode) {
  currentMode = mode;

  const indicator = document.getElementById("mode-indicator");
  indicator.classList.remove("playground", "problem");
  const testInput = document.getElementById("testStrings"); //kruvei to input

  if (mode === "problem") {
    indicator.textContent = "Problem Solving Mode";
    document.body.classList.add("problem-mode");
    indicator.classList.add("problem");
  } else {
    indicator.textContent = "Playground Mode";
    indicator.classList.add("playground");
    document.body.classList.remove("problem-mode");
    currentProblemId = null;
  }
  if (testInput) {
    testInput.disabled = mode === "problem";
  }
  updateTestButton();
}

function openProblemModal() {
  const modal = document.getElementById("problem-modal");
  const modalBox = document.getElementById("problem-modal-box");
  const minimizeBtn = document.getElementById("minimizeProblemModal");
  setMode("problem");

  modalBox.classList.remove("minimized");
  minimizeBtn.textContent = "−";

  modal.classList.remove("hidden");
}

function closeProblemModal() {
  document.getElementById("problem-modal").classList.add("hidden");
  setMode("playground");
}

const minimizeBtn = document.getElementById("minimizeProblemModal");
const modalBox = document.getElementById("problem-modal-box");
const modalHeader = document.getElementById("problem-modal-header");
const container = document.getElementById("svg-container");

minimizeBtn.addEventListener("click", () => {
  modalBox.classList.toggle("minimized");

  if (modalBox.classList.contains("minimized")) {
    minimizeBtn.textContent = "+";
  } else {
    minimizeBtn.textContent = "−";
  }
});

// allaazei kai to button sthn allagh mode
function updateTestButton() {
  const testBtn = document.getElementById("testFA");
  if (!testBtn) return;

  if (currentMode === "problem" && currentProblemId) {
    testBtn.textContent = "Check Solution";
    testBtn.title = "Check your automaton against the current problem";
  } else {
    testBtn.textContent = "Test";
    testBtn.title = "Test strings for the current automaton";
  }
}

document
  .getElementById("closeProblemModal")
  .addEventListener("click", closeProblemModal);

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

modalHeader.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = modalBox.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const containerRect = container.getBoundingClientRect();

  let newLeft = e.clientX - offsetX - containerRect.left;
  let newTop = e.clientY - offsetY - containerRect.top;

  // kinhsh entos oriwn tou container
  const maxLeft = container.clientWidth - modalBox.offsetWidth;
  const maxTop = container.clientHeight - modalBox.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  newTop = Math.max(0, Math.min(newTop, maxTop));

  modalBox.style.left = `${newLeft}px`;
  modalBox.style.top = `${newTop}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.querySelectorAll(".problem-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".problem-card");
    if (!card) return;

    const problemId = card.dataset.problemId || null;
    currentProblemId = problemId;

    const type = problemId?.startsWith("dfa") ? "DFA" : "NFA";
    const problem = problemBank[problemId];
    const title = problem?.title ?? "";
    const alphabet = problem?.alphabet ?? "";
    const description =
      problem?.description ??
      card.querySelector(".problem-description")?.textContent ??
      "";

    // gemizei to modal me ta dedomena tou provlhmatos
    document.getElementById("problemModalTitle").textContent = title;
    document.getElementById("problemModalType").textContent = "Type: " + type;
    document.getElementById("problemModalAlphabet").textContent =
      "Alphabet: " + alphabet;
    document.getElementById("problemModalDescription").textContent =
      description;

    scrollToCanvas();
    setAutomatonMode(type);
    openProblemModal();
  });
});

// getters gia th main.js
window.problemBank = problemBank;
window.getCurrentProblemId = function () {
  return currentProblemId;
};
window.getCurrentMode = function () {
  return currentMode;
};
