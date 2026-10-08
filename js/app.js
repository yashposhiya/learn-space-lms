import { STORAGE } from "./data/config.js";
import { currentUser, initializeStorage, read, write } from "./services/storage.js";
import { go, toast } from "./utils/dom.js";
import { renderHome } from "./modules/home.js";
import { renderAuth, renderForgotPassword } from "./modules/auth.js";
import { renderDashboard, renderCourses } from "./modules/student.js";
import { renderAdmin, renderStudents, showCourseModal, showAssignmentModal, deleteCourse } from "./modules/admin.js";
import { renderAssignments, submitAssignment } from "./modules/assignments.js";

async function route() {
  const path = window.location.hash.slice(1) || "home", user = currentUser();
  if (!user && ["dashboard", "courses", "students", "assignments"].includes(path)) { go("login"); return; }
  if (user && ["login", "signup", "forgot-password"].includes(path)) { go("dashboard"); return; }
  if (path === "home") await renderHome();
  else if (path === "login" || path === "signup") await renderAuth(path);
  else if (path === "forgot-password") await renderForgotPassword();
  else if (path === "students" && user?.role === "admin") await renderStudents();
  else if (path === "assignments" && user) await renderAssignments();
  else if (path === "dashboard" && user) await renderDashboard();
  else if (path === "courses" && user?.role === "student") await renderCourses();
  else if (path === "courses" && user?.role === "admin") await renderAdmin();
  else if (path === "students" && user?.role !== "admin") go("dashboard");
  else go(user ? "dashboard" : "home");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) go(routeButton.dataset.route);
  if (event.target.closest("[data-logout]")) {
    localStorage.removeItem(STORAGE.session);
    go("home");
    toast("You have been logged out.");
  }
  const enroll = event.target.closest("[data-enroll]");
  if (enroll) {
    const user = currentUser();
    if (!user || user.role !== "student") return;
    const records = read(STORAGE.enrollments, []);
    if (!records.some((item) => item.userId === user.id && item.courseId === enroll.dataset.enroll)) records.push({ userId: user.id, courseId: enroll.dataset.enroll, progress: 0 });
    write(STORAGE.enrollments, records);
    renderDashboard();
    toast("You are enrolled in the course.");
  }
  const progress = event.target.closest("[data-progress]");
  if (progress) {
    const records = read(STORAGE.enrollments, []), user = currentUser();
    const record = records.find((item) => item.userId === user?.id && item.courseId === progress.dataset.progress);
    if (!record) return;
    record.progress = Math.min(100, record.progress + 25);
    write(STORAGE.enrollments, records);
    renderDashboard();
    toast(record.progress === 100 ? "Course completed! Great work." : "Lesson marked complete.");
  }
  if (event.target.closest("[data-modal]")) showCourseModal();
  if (event.target.closest("[data-add-assignment]")) showAssignmentModal();
  const remove = event.target.closest("[data-delete-course]");
  if (remove && confirm("Remove this course from the catalogue?")) deleteCourse(remove.dataset.deleteCourse);
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest(".assignment-form");
  if (!form) return;
  event.preventDefault();
  if (!submitAssignment(form)) return;
  await renderAssignments();
  toast("Assignment uploaded successfully.");
});

initializeStorage();
window.addEventListener("hashchange", route);
route();
