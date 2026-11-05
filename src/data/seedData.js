export const seedUsers = [
  { id: "admin", name: "System Admin", email: "admin@college.edu", password: "admin123", role: "admin" },
  { id: "teacher-1", name: "Prof. Mehta", email: "teacher@college.edu", password: "teacher123", role: "teacher" },
  { id: "teacher-2", name: "Ms. Rao", email: "rao@college.edu", password: "teacher123", role: "teacher" },
  { id: "teacher-3", name: "Dr. Shah", email: "shah@college.edu", password: "teacher123", role: "teacher" },
];

export const seedCourses = [
  { id: "web", title: "Frontend Development", description: "Build accessible websites with HTML, CSS and JavaScript.", instructor: "Prof. Mehta", teacherId: "teacher-1", lessons: 12, category: "Web" },
  { id: "data", title: "Data Structures", description: "Understand arrays, stacks, queues and problem solving.", instructor: "Dr. Shah", teacherId: "teacher-1", lessons: 10, category: "Computer Science" },
  { id: "design", title: "UI/UX Fundamentals", description: "Learn user research, wireframing and visual design basics.", instructor: "Ms. Rao", teacherId: "teacher-2", lessons: 8, category: "Design" },
];

export const seedAssignments = [
  { id: "a1", courseId: "web", title: "Build a responsive landing page", due: "2026-12-10", points: 20 },
  { id: "a2", courseId: "data", title: "Stack and queue worksheet", due: "2026-12-15", points: 15 },
];
