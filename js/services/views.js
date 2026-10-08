export async function loadMarkup(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load view: ${path}`);
  const markup = await response.text();
  const documentView = new DOMParser().parseFromString(markup, "text/html");
  const view = document.createDocumentFragment();
  for (const child of documentView.body.childNodes)
    view.append(document.importNode(child, true));
  return view;
}

export async function mountPublicView(path) {
  const header = document.getElementById("public-nav");
  header.classList.remove("hidden");
  document.getElementById("app").replaceChildren(await loadMarkup(path));
}

export async function mountAppView(path, user, active) {
  const [layout, view] = await Promise.all([
    loadMarkup("views/components/app-shell.html"),
    loadMarkup(path),
  ]);
  document.getElementById("public-nav").classList.add("hidden");
  layout.querySelector("[data-user-name]").textContent = user.name;
  layout.querySelector("[data-user-avatar]").textContent = user.name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  layout.querySelector("[data-page-title]").textContent =
    active === "students"
      ? "Students"
      : active === "courses"
        ? user.role === "admin"
          ? "Manage courses"
          : "My courses"
        : active === "assignments"
          ? user.role === "admin"
            ? "Assignment submissions"
            : "Assignments"
          : "Dashboard";
  layout
    .querySelectorAll("[data-nav]")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.nav === active),
    );
  layout
    .querySelectorAll("[data-student-label]")
    .forEach((item) =>
      item.classList.toggle("hidden", user.role !== "student"),
    );
  layout
    .querySelectorAll("[data-admin-label], [data-admin-only]")
    .forEach((item) => item.classList.toggle("hidden", user.role !== "admin"));
  layout.querySelector("[data-view-outlet]").append(view);
  document.getElementById("app").replaceChildren(layout);
  return document.getElementById("app");
}
