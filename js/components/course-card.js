export function createCourseCard(course, options = {}) {
  const { admin = false, enrollment = null } = options;
  const article = document.createElement("article");
  article.className = "course-card";
  const banner = document.createElement("div");
  banner.className = "course-banner";
  banner.textContent = admin
    ? "📘"
    : course.category === "Web"
      ? "🌐"
      : course.category === "Design"
        ? "🎨"
        : "🧠";
  const body = document.createElement("div");
  body.className = "course-body";
  const title = document.createElement("h3");
  title.textContent = course.title;
  const description = document.createElement("p");
  description.textContent = course.description;
  const meta = document.createElement("div");
  meta.className = "course-meta";
  const lessons = document.createElement("span");
  lessons.textContent = `${course.lessons} lessons`;
  const detail = document.createElement("span");
  detail.textContent = admin
    ? course.instructor
    : enrollment
      ? `${enrollment.progress}% complete`
      : "Not enrolled";
  meta.append(lessons, detail);
  body.append(title, description, meta);

  const action = document.createElement("button");
  action.className = `btn ${admin ? "btn-danger" : enrollment ? "btn-secondary" : "btn-primary"}`;
  action.style.width = "100%";
  if (admin) {
    action.textContent = "Remove course";
    action.dataset.deleteCourse = course.id;
  } else if (enrollment) {
    const progress = document.createElement("div");
    progress.className = "progress";
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.style.width = `${enrollment.progress}%`;
    progress.append(bar);
    action.style.marginTop = "13px";
    action.textContent =
      enrollment.progress === 100 ? "Completed" : "Mark lesson complete";
    action.dataset.progress = course.id;
    body.append(progress);
  } else {
    action.textContent = "Enroll now";
    action.dataset.enroll = course.id;
  }
  body.append(action);
  article.append(banner, body);
  return article;
}
