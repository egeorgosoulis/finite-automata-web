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

//enallagh tabs login/register
signInTab.addEventListener("click", () => {
    signInTab.classList.add("active");
    signUpTab.classList.remove("active");
    submitButton.textContent = "Sign In";
});

signUpTab.addEventListener("click", () => {
    signUpTab.classList.add("active");
    signInTab.classList.remove("active");
    submitButton.textContent = "Sign Up";
});
