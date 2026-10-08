import { STORAGE, seedCourses, seedAssignments } from "../data/config.js";

export function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from Local Storage.`, error);
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function currentUser() {
  return read(STORAGE.session, null);
}

export function initializeStorage() {
  if (!localStorage.getItem(STORAGE.courses))
    write(STORAGE.courses, seedCourses);
  const users = read(STORAGE.users, []);
  if (!users.some((user) => user.email === "admin@college.edu")) {
    users.push({
      id: "admin",
      name: "System Admin",
      email: "admin@college.edu",
      password: "admin123",
      role: "admin",
    });
    write(STORAGE.users, users);
  }
  if (!localStorage.getItem(STORAGE.assignments))
    write(STORAGE.assignments, seedAssignments);
  if (!localStorage.getItem(STORAGE.submissions))
    write(STORAGE.submissions, []);
}
