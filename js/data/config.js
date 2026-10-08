export const STORAGE = {
  users: "learnspace_users",
  courses: "learnspace_courses",
  enrollments: "learnspace_enrollments",
  assignments: "learnspace_assignments",
  submissions: "learnspace_submissions",
  session: "learnspace_session",
};

export const seedCourses = [
  {
    id: "web",
    title: "Frontend Development",
    description: "Build accessible websites with HTML, CSS and JavaScript.",
    instructor: "Prof. Mehta",
    lessons: 12,
    category: "Web",
  },
  {
    id: "data",
    title: "Data Structures",
    description: "Understand arrays, stacks, queues and problem solving.",
    instructor: "Dr. Shah",
    lessons: 10,
    category: "Computer Science",
  },
  {
    id: "design",
    title: "UI/UX Fundamentals",
    description: "Learn user research, wireframing and visual design basics.",
    instructor: "Ms. Rao",
    lessons: 8,
    category: "Design",
  },
  {
    id: "communication",
    title: "Professional Communication",
    description: "Improve writing, presentations and workplace collaboration.",
    instructor: "Prof. Khan",
    lessons: 6,
    category: "Soft Skills",
  },
];

export const seedAssignments = [
  {
    id: "assignment-web-1",
    courseId: "web",
    title: "Build a responsive landing page",
    due: "2026-10-10",
    points: 20,
  },
  {
    id: "assignment-data-1",
    courseId: "data",
    title: "Stack and queue worksheet",
    due: "2026-10-15",
    points: 15,
  },
  {
    id: "assignment-design-1",
    courseId: "design",
    title: "Create a mobile app wireframe",
    due: "2026-10-20",
    points: 25,
  },
];
