import { STORAGE, seedCourses, seedAssignments } from "../data/config.js";
import { read, write } from "../services/storage.js";
import { toast } from "../utils/dom.js";
import { mountAppView, loadMarkup } from "../services/views.js";
import { createCourseCard } from "../components/course-card.js";

export async function renderAdmin() {
  const users = read(STORAGE.users, []),
    courses = read(STORAGE.courses, seedCourses),
    assignments = read(STORAGE.assignments, seedAssignments);
  const root = await mountAppView(
    "views/admin.html",
    read(STORAGE.session, null),
    "courses",
  );
  root.querySelector("[data-total-courses]").textContent = courses.length;
  root.querySelector("[data-student-count]").textContent = users.filter(
    (item) => item.role === "student",
  ).length;
  const list = root.querySelector("[data-admin-course-list]");
  courses.forEach((course) =>
    list.append(createCourseCard(course, { admin: true })),
  );
  const assignmentList = root.querySelector("[data-admin-assignment-list]");
  if (!assignments.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No assignments yet. Add one for a course.";
    assignmentList.append(empty);
  } else {
    assignments.forEach((assignment) => {
      const course = courses.find((item) => item.id === assignment.courseId),
        card = document.createElement("article");
      const title = document.createElement("strong"),
        details = document.createElement("span");
      card.className = "assignment-admin-card";
      title.textContent = assignment.title;
      details.textContent = `${course?.title || "Course removed"} · Due ${formatDueDate(assignment.due)} · ${assignment.points} points`;
      card.append(title, details);
      assignmentList.append(card);
    });
  }
}

export async function renderStudents() {
  const students = read(STORAGE.users, []).filter(
      (user) => user.role === "student",
    ),
    enrollments = read(STORAGE.enrollments, []);
  const root = await mountAppView(
      "views/students.html",
      read(STORAGE.session, null),
      "students",
    ),
    rows = root.querySelector("[data-student-rows]");
  if (!students.length) {
    const row = document.createElement("tr"),
      cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "empty";
    cell.textContent = "No student accounts yet.";
    row.append(cell);
    rows.append(row);
    return;
  }
  students.forEach((student) => {
    const row = document.createElement("tr"),
      identity = document.createElement("td"),
      name = document.createElement("strong"),
      email = document.createElement("span"),
      count = document.createElement("td"),
      statusCell = document.createElement("td"),
      badge = document.createElement("span");
    name.textContent = student.name;
    email.className = "form-note";
    email.textContent = student.email;
    identity.append(name, document.createElement("br"), email);
    count.textContent = enrollments.filter(
      (item) => item.userId === student.id,
    ).length;
    badge.className = "badge";
    badge.textContent = "Active";
    statusCell.append(badge);
    row.append(identity, count, statusCell);
    rows.append(row);
  });
}

export async function showCourseModal() {
  const modalTemplate = await loadMarkup("views/components/course-modal.html");
  const modal = modalTemplate.firstElementChild;
  document.body.append(modal);
  modal
    .querySelector("[data-close]")
    .addEventListener("click", () => modal.remove());
  modal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target),
      courses = read(STORAGE.courses, seedCourses);
    courses.push({
      id: `course-${Date.now()}`,
      title: data.get("title"),
      description: data.get("description"),
      instructor: data.get("instructor"),
      lessons: Number(data.get("lessons")),
      category: "General",
    });
    write(STORAGE.courses, courses);
    modal.remove();
    renderAdmin();
    toast("Course added successfully");
  });
}

export async function showAssignmentModal() {
  const courses = read(STORAGE.courses, seedCourses);
  if (!courses.length) {
    toast("Add a course before creating an assignment.");
    return;
  }
  const modalTemplate = await loadMarkup(
      "views/components/assignment-modal.html",
    ),
    modal = modalTemplate.firstElementChild;
  const courseSelect = modal.querySelector("#assignment-course"),
    dueInput = modal.querySelector("#assignment-due");
  courses.forEach((course) =>
    courseSelect.add(new Option(course.title, course.id)),
  );
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dueInput.min = today.toISOString().slice(0, 10);
  document.body.append(modal);
  modal
    .querySelector("[data-close]")
    .addEventListener("click", () => modal.remove());
  modal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    if (data.get("due") < dueInput.min) {
      dueInput.setCustomValidity("Choose today or a future date.");
      dueInput.reportValidity();
      return;
    }
    const assignments = read(STORAGE.assignments, seedAssignments);
    assignments.push({
      id: `assignment-${Date.now()}`,
      courseId: data.get("courseId"),
      title: data.get("title").trim(),
      due: data.get("due"),
      points: Number(data.get("points")),
    });
    write(STORAGE.assignments, assignments);
    modal.remove();
    renderAdmin();
    toast("Assignment created successfully.");
  });
  dueInput.addEventListener("input", () => dueInput.setCustomValidity(""));
}

export function deleteCourse(courseId) {
  write(
    STORAGE.courses,
    read(STORAGE.courses, seedCourses).filter(
      (course) => course.id !== courseId,
    ),
  );
  renderAdmin();
  toast("Course removed.");
}

function formatDueDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
