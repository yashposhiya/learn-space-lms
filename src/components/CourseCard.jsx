import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { read, write, STORAGE_KEYS } from "../services/storage.js";
import { Button } from "./ui.jsx";

export default function CourseCard({ course }) {
  const { user } = useAuth();
  const [records, setRecords] = useState(() => read(STORAGE_KEYS.enrollments, []));
  const enrollment = records.find((item) => item.userId === user.id && item.courseId === course.id);
  const updateProgress = () => {
    const next = enrollment
      ? records.map((item) => item === enrollment ? { ...item, progress: Math.min(100, item.progress + 25) } : item)
      : [...records, { userId: user.id, courseId: course.id, progress: 0 }];
    write(STORAGE_KEYS.enrollments, next);
    setRecords(next);
  };
  return <article className="course-card">
    <div className="course-art">{course.category === "Web" ? "◈" : course.category === "Design" ? "✦" : "◉"}</div>
    <div className="course-body"><span className="eyebrow">{course.category}</span><h3>{course.title}</h3><p>{course.description}</p>
      <div className="course-meta"><span>{course.lessons} lessons</span><span>{course.instructor}</span></div>
      {user.role === "student" && <><div className="progress"><i style={{ width: `${enrollment?.progress || 0}%` }} /></div><Button variant={enrollment ? "secondary" : "primary"} onClick={updateProgress}>{enrollment ? enrollment.progress === 100 ? "Completed" : "Mark lesson complete" : "Enroll now"}</Button></>}
      {user.role !== "student" && <span className="tag">{course.teacherId === user.id ? "Your course" : "Managed course"}</span>}
    </div>
  </article>;
}
