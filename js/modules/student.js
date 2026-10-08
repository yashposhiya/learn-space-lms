import { STORAGE, seedCourses } from "../data/config.js";
import { read, currentUser } from "../services/storage.js";
import { mountAppView } from "../services/views.js";
import { createCourseCard } from "../components/course-card.js";
import { renderAdmin } from "./admin.js";

export async function renderDashboard() {
  const user = currentUser();
  if (user.role === "admin") {
    await renderAdmin();
    return;
  }
  const root = await mountAppView("views/dashboard.html", user, "dashboard");
  const courses = read(STORAGE.courses, seedCourses),
    enrollments = read(STORAGE.enrollments, []).filter(
      (item) => item.userId === user.id,
    );
  root.querySelector("[data-greeting]").textContent =
    `Good morning, ${user.name.split(" ")[0]}! 👋`;
  root.querySelector("[data-enrolled-count]").textContent = enrollments.length;
  root.querySelector("[data-completed-count]").textContent = enrollments.filter(
    (item) => item.progress === 100,
  ).length;
  root.querySelector("[data-hours-count]").textContent = enrollments.length * 3;
  const list = root.querySelector("[data-course-list]");
  courses.forEach((course) =>
    list.append(
      createCourseCard(course, {
        enrollment: enrollments.find((item) => item.courseId === course.id),
      }),
    ),
  );
}

export async function renderCourses() {
  const user = currentUser(),
    root = await mountAppView("views/courses.html", user, "courses");
  const courses = read(STORAGE.courses, seedCourses),
    enrollments = read(STORAGE.enrollments, []).filter(
      (item) => item.userId === user.id,
    );
  const enrolled = courses.filter((course) =>
    enrollments.some((item) => item.courseId === course.id),
  );
  enrolled.forEach((course) =>
    root
      .querySelector("[data-course-list]")
      .append(
        createCourseCard(course, {
          enrollment: enrollments.find((item) => item.courseId === course.id),
        }),
      ),
  );
  root.querySelector("[data-course-empty]").hidden = enrolled.length > 0;
}
