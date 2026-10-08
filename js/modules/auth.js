import { STORAGE } from "../data/config.js";
import { read, write } from "../services/storage.js";
import { mountPublicView } from "../services/views.js";
import { toast, go } from "../utils/dom.js";

export async function renderAuth(mode) {
  await mountPublicView("views/auth.html");
  const login = mode === "login",
    form = document.getElementById("auth-form");
  document.querySelector("[data-auth-eyebrow]").textContent = login
    ? "Welcome back"
    : "Join the classroom";
  document.querySelector("[data-auth-title]").textContent = login
    ? "Log in to LearnSpace"
    : "Create an account";
  document.querySelector("[data-auth-description]").textContent = login
    ? "Use your college account to continue learning."
    : "Start learning with your college community today.";
  document.querySelector("[data-auth-submit]").textContent = login
    ? "Log in"
    : "Sign up";
  document.querySelector("[data-name-group]").classList.toggle("hidden", login);
  document.querySelector("[data-name-group] input").required = !login;
  document
    .querySelector("[data-login-help]")
    .classList.toggle("hidden", !login);
  document
    .querySelector("[data-admin-demo]")
    .classList.toggle("hidden", !login);
  document.querySelector("[data-auth-switch-label]").textContent = login
    ? "New to LearnSpace?"
    : "Already have an account?";
  const switchButton = document.querySelector("[data-auth-switch-button]");
  switchButton.textContent = login ? "Create account" : "Log in";
  switchButton.dataset.route = login ? "signup" : "login";
  form.addEventListener("submit", (event) => handleAuth(event, login));
}

function handleAuth(event, isLogin) {
  event.preventDefault();
  const form = new FormData(event.target),
    email = form.get("email").trim().toLowerCase(),
    password = form.get("password");
  const users = read(STORAGE.users, []),
    error = document.getElementById("auth-error");
  if (isLogin) {
    const user = users.find(
      (item) => item.email === email && item.password === password,
    );
    if (!user) {
      error.textContent = "Email or password is incorrect.";
      return;
    }
    write(STORAGE.session, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    if (users.some((item) => item.email === email)) {
      error.textContent = "An account with this email already exists.";
      return;
    }
    const user = {
      id: `u${Date.now()}`,
      name: form.get("name").trim(),
      email,
      password,
      role: "student",
    };
    users.push(user);
    write(STORAGE.users, users);
    write(STORAGE.session, {
      id: user.id,
      name: user.name,
      email,
      role: user.role,
    });
  }
  go("dashboard");
}

export async function renderForgotPassword() {
  await mountPublicView("views/forgot-password.html");
  document.getElementById("reset-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target),
      email = data.get("email").trim().toLowerCase(),
      password = data.get("password");
    const error = document.getElementById("reset-error");
    if (password !== data.get("confirmPassword")) {
      error.textContent = "The passwords do not match.";
      return;
    }
    const users = read(STORAGE.users, []),
      user = users.find((item) => item.email === email);
    if (!user) {
      error.textContent = "No account was found with that email address.";
      return;
    }
    user.password = password;
    write(STORAGE.users, users);
    toast("Password updated. Log in with your new password.");
    go("login");
  });
}
