import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { Button } from "../../components/ui.jsx";

export function LandingPage() {
  return <main className="landing"><div><span className="eyebrow">College learning management system</span><h1>Learn at your pace. <em>Grow with purpose.</em></h1><p>A focused digital classroom for students, teachers, and administrators to learn, teach, and manage academic content in one place.</p><NavLink className="button primary" to="/login">Enter LearnSpace →</NavLink></div><div className="hero-panel"><span className="eyebrow">One connected classroom</span><h2>Everything your learning community needs.</h2><div className="hero-stats"><strong>03</strong><span>Role-based workspaces</span><strong>24/7</strong><span>Access to learning</span></div></div></main>;
}

export function AuthPage({ mode }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = mode === "login"
      ? login(data.get("email"), data.get("password"))
      : signup(data.get("name"), data.get("email"), data.get("password"));
    if (result) setError(result); else navigate("/dashboard");
  };
  return <main className="auth-page"><NavLink className="brand" to="/"><span className="brand-mark">L</span> LearnSpace</NavLink><section className="auth-card"><span className="eyebrow">{mode === "login" ? "Welcome back" : "Join the classroom"}</span><h1>{mode === "login" ? "Log in to LearnSpace" : "Create a student account"}</h1><p>Use your college account to continue.</p><form onSubmit={submit}>{mode === "signup" && <label>Full name<input name="name" required /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength="6" required /></label>{error && <div className="error">{error}</div>}<Button>{mode === "login" ? "Log in" : "Sign up"}</Button></form><p className="auth-switch">{mode === "login" ? "New to LearnSpace? " : "Already have an account? "}<NavLink to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create account" : "Log in"}</NavLink></p></section></main>;
}
