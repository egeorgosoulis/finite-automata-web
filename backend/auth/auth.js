const authModal = document.getElementById("auth-modal");
const closeModalButton = document.getElementById("closeModalButton");
const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const submitButton = document.getElementById("submit-auth");

document.getElementById("authButton").addEventListener("click", () => {
    authModal.classList.remove("hidden");   //emfanish modal
});

closeModalButton.addEventListener("click", () => {
    authModal.classList.add("hidden");  //apokrupsh
});

//kleisimo modal me click ektos tou parathurou
window.addEventListener("click", (e) => {
    if (e.target === authModal) {
        authModal.classList.add("hidden");
    }
});

signInTab.addEventListener("click", () => {
    setAuthMode("signin");
});

signUpTab.addEventListener("click", () => {
    setAuthMode("signup");
});

function setAuthMode(mode) {
    const isSignIn = mode === "signin";
    signInTab.classList.toggle("active", isSignIn);
    signUpTab.classList.toggle("active", !isSignIn);
    submitButton.textContent = getTranslation(isSignIn ? "signInTab" : "signUpTab");
}