import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { applyTheme, getTheme, THEMES } from "../services/theme.js";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const links = user.role === "student"
    ? [["/dashboard", "Dashboard"], ["/courses", "My courses"], ["/assignments", "Assignments"]]
    : user.role === "teacher"
      ? [["/dashboard", "Dashboard"], ["/courses", "Your courses"], ["/assignments", "Assignments"]]
      : [["/dashboard", "Dashboard"], ["/courses", "Manage courses"], ["/users", "Users"], ["/assignments", "Submissions"]];
  const changeTheme = (nextTheme) => {
    setTheme(applyTheme(nextTheme));
  };
  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [profileOpen]);
  return <div className="app-shell"><aside><NavLink className="brand" to="/dashboard"><span className="brand-mark">L</span> LearnSpace</NavLink><div className="role-badge">{user.role} workspace</div><nav>{links.map(([to, label]) => <NavLink key={to} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`} to={to}>{label}</NavLink>)}</nav><div className="sidebar-bottom"><span>College LMS · Group Project</span></div></aside><main className="content"><header><div><span className="eyebrow">{user.role} workspace</span><h2>Good morning, {user.name.split(" ")[0]}!</h2></div><div className="header-actions"><button className="settings-button" aria-label="Open theme settings" onClick={() => setSettingsOpen(true)}>✦</button><div className="profile-menu" ref={profileRef}><button className="avatar" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>{user.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}</button>{profileOpen && <div className="profile-dropdown"><strong>{user.name}</strong><small>{user.email}</small><span className="profile-divider" /><button onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}>⚙ Settings</button><button className="logout-action" onClick={() => { logout(); navigate("/"); }}>Log out</button></div>}</div></div></header>{settingsOpen && <ThemeSettings theme={theme} onChange={changeTheme} onClose={() => setSettingsOpen(false)} />} {children}</main></div>;
}

function ThemeSettings({ theme, onChange, onClose }) {
  return <div className="theme-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="theme-modal" role="dialog" aria-modal="true" aria-labelledby="theme-title"><div className="theme-modal-header"><div><span className="eyebrow">Personalize your workspace</span><h3 id="theme-title">Choose a visual theme</h3><p>Your preference is saved on this browser.</p></div><button className="modal-close" aria-label="Close theme settings" onClick={onClose}>×</button></div><div className="theme-options">{THEMES.map((item) => <button className={`theme-option ${theme === item.id ? "selected" : ""}`} key={item.id} onClick={() => onChange(item.id)}><span className="theme-swatch" style={{ background: item.gradient }} /><span><strong>{item.name}</strong><small>{item.description}</small></span><i>{theme === item.id ? "✓" : ""}</i></button>)}</div></section></div>;
}
