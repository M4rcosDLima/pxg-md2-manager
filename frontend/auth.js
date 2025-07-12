firebase.auth().onAuthStateChanged(user => {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");

  if (user) {
    loginBtn.textContent = "Sair";
    registerBtn.style.display = "none";

    loginBtn.onclick = () => {
      firebase.auth().signOut().then(() => location.reload());
    };

    loadPersonagens(user.uid);
  } else {
    loginBtn.textContent = "Login";
    registerBtn.style.display = "inline-block";

    loginBtn.onclick = () => window.location.href = "login.html";
    registerBtn.onclick = () => window.location.href = "sign-in.html";
  }
});
