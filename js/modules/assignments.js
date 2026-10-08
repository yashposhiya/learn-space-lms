import { STORAGE, seedAssignments } from "../data/config.js";
import { currentUser, read, write } from "../services/storage.js";
import { mountAppView } from "../services/views.js";

export async function renderAssignments() {
  const user = currentUser(),
    courses = read(STORAGE.courses, []),
    assignments = read(STORAGE.assignments, seedAssignments);
  if (user.role === "admin") {
    const submissions = read(STORAGE.submissions, []),
      users = read(STORAGE.users, []);
    const root = await mountAppView(
        "views/assignments-admin.html",
        user,
        "assignments",
      ),
      rows = root.querySelector("[data-submission-rows]");
    root.querySelector("[data-submission-count]").textContent =
      `${submissions.length} submission(s)`;
    if (!submissions.length) {
      addEmptyRow(rows, 4, "No assignments have been submitted yet.");
      return;
    }
    submissions.forEach((item) => {
      const student = users.find((record) => record.id === item.userId),
        assignment = assignments.find(
          (record) => record.id === item.assignmentId,
        ),
        row = document.createElement("tr");
      const studentCell = document.createElement("td"),
        name = document.createElement("strong"),
        email = document.createElement("span");
      name.textContent = student?.name || "Unknown student";
      email.className = "form-note";
      email.textContent = student?.email || "";
      studentCell.append(name, document.createElement("br"), email);
      row.append(
        studentCell,
        textCell(assignment?.title || "Deleted assignment"),
        textCell(item.fileName),
        badgeCell(item.status),
      );
      rows.append(row);
    });
    return;
  }
  const root = await mountAppView(
    "views/assignments-student.html",
    user,
    "assignments",
  );
  const enrolledIds = read(STORAGE.enrollments, [])
      .filter((item) => item.userId === user.id)
      .map((item) => item.courseId),
    submissions = read(STORAGE.submissions, []);
  const visibleAssignments = assignments.filter((item) =>
      enrolledIds.includes(item.courseId),
    ),
    list = root.querySelector("[data-assignment-list]");
  visibleAssignments.forEach((item) => {
    const course = courses.find((record) => record.id === item.courseId),
      submission = submissions.find(
        (record) =>
          record.assignmentId === item.id && record.userId === user.id,
      );
    list.append(
      createAssignmentCard(item, course?.title || "Course", submission),
    );
  });
  root.querySelector("[data-assignment-empty]").hidden =
    visibleAssignments.length > 0;
}

function createAssignmentCard(assignment, courseTitle, submission) {
  const article = document.createElement("article");
  article.className = "assignment-card";
  const icon = document.createElement("div");
  icon.className = "assignment-icon";
  icon.textContent = "📝";
  const content = document.createElement("div"),
    eyebrow = document.createElement("span"),
    title = document.createElement("h3"),
    due = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = courseTitle;
  title.textContent = assignment.title;
  due.textContent = `Due ${formatDueDate(assignment.due)} · ${assignment.points} points`;
  content.append(eyebrow, title, due);
  if (submission) {
    const submitted = document.createElement("div"),
      status = document.createElement("small");
    submitted.className = "submitted";
    submitted.append(
      document.createTextNode(`✓ Submitted: ${submission.fileName}`),
      document.createElement("br"),
    );
    status.textContent = submission.status;
    submitted.append(status);
    content.append(submitted);
  } else {
    const form = document.createElement("form"),
      input = document.createElement("input"),
      button = document.createElement("button");
    form.className = "assignment-form";
    form.dataset.assignment = assignment.id;
    input.type = "file";
    input.required = true;
    input.setAttribute("aria-label", "Choose assignment file");
    button.className = "btn btn-primary";
    button.textContent = "Upload assignment";
    form.append(input, button);
    content.append(form);
  }
  article.append(icon, content);
  return article;
}

export function submitAssignment(form) {
  const file = form.querySelector("input[type=file]").files[0];
  if (!file) return false;
  const submissions = read(STORAGE.submissions, []);
  submissions.push({
    id: `submission-${Date.now()}`,
    userId: currentUser().id,
    assignmentId: form.dataset.assignment,
    fileName: file.name,
    status: "Submitted",
  });
  write(STORAGE.submissions, submissions);
  return true;
}

function textCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}
function badgeCell(value) {
  const cell = textCell("");
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = value;
  cell.append(badge);
  return cell;
}
function addEmptyRow(tbody, columns, message) {
  const row = document.createElement("tr"),
    cell = document.createElement("td");
  cell.colSpan = columns;
  cell.className = "empty";
  cell.textContent = message;
  row.append(cell);
  tbody.append(row);
}
function formatDueDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
