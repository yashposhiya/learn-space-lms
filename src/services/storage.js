export const STORAGE_KEYS = {
  users: "learnspace_users",
  session: "learnspace_session",
  courses: "learnspace_courses",
  enrollments: "learnspace_enrollments",
  assignments: "learnspace_assignments",
  submissions: "learnspace_submissions",
  teacherStudents: "learnspace_teacher_students",
};

export function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedStorage(users, courses, assignments) {
  const storedUsers = read(STORAGE_KEYS.users, []);
  const missingUsers = users.filter((seedUser) => !storedUsers.some((user) => user.id === seedUser.id));
  if (missingUsers.length) write(STORAGE_KEYS.users, [...storedUsers, ...missingUsers]);
  else if (!localStorage.getItem(STORAGE_KEYS.users)) write(STORAGE_KEYS.users, users);
  if (!localStorage.getItem(STORAGE_KEYS.courses)) write(STORAGE_KEYS.courses, courses);
  if (!localStorage.getItem(STORAGE_KEYS.assignments)) write(STORAGE_KEYS.assignments, assignments);
  if (!localStorage.getItem(STORAGE_KEYS.enrollments)) write(STORAGE_KEYS.enrollments, []);
  if (!localStorage.getItem(STORAGE_KEYS.submissions)) write(STORAGE_KEYS.submissions, []);
  if (!localStorage.getItem(STORAGE_KEYS.teacherStudents)) write(STORAGE_KEYS.teacherStudents, []);
}
