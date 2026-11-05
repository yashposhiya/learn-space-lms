import { createContext, useContext, useState } from "react";
import { read, write, STORAGE_KEYS } from "../../services/storage.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(STORAGE_KEYS.session, null));
  const login = (email, password) => {
    const found = read(STORAGE_KEYS.users, []).find(
      (item) => item.email === email.trim().toLowerCase() && item.password === password,
    );
    if (!found) return "Email or password is incorrect.";
    const session = { id: found.id, name: found.name, email: found.email, role: found.role };
    write(STORAGE_KEYS.session, session);
    setUser(session);
    return null;
  };
  const signup = (name, email, password, role = "student") => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = read(STORAGE_KEYS.users, []);
    if (users.some((item) => item.email === normalizedEmail)) return "An account with this email already exists.";
    const created = { id: `${role}-${Date.now()}`, name: name.trim(), email: normalizedEmail, password, role };
    write(STORAGE_KEYS.users, [...users, created]);
    if (role === "student") {
      const session = { id: created.id, name: created.name, email: created.email, role };
      write(STORAGE_KEYS.session, session);
      setUser(session);
    }
    return null;
  };
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}
