import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { read, write, STORAGE_KEYS } from "../../services/storage.js";
import {
  createAssignment as addAssignment,
  getAssignmentFile,
  getAssignments,
  getSubmissionFile,
  getSubmissions,
  saveSubmission,
} from "../../services/assignmentStore.js";
import CourseCard from "../../components/CourseCard.jsx";
import { Button, Stat } from "../../components/ui.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const courses = read(STORAGE_KEYS.courses, []);
  const visible = user.role === "teacher" ? courses.filter((course) => course.teacherId === user.id) : courses;
  const enrollments = read(STORAGE_KEYS.enrollments, []).filter((item) => item.userId === user.id);
  const learnerCount = read(STORAGE_KEYS.enrollments, []).filter((item) => visible.some((course) => course.id === item.courseId)).length;
  return <><section className="welcome"><span className="eyebrow">{user.role === "admin" ? "Control center" : "Keep moving forward"}</span><h1>{user.role === "admin" ? "Manage the learning community." : user.role === "teacher" ? "Create meaningful learning experiences." : "Your next achievement starts here."}</h1><p>Pick up where you left off and make progress today.</p></section><div className="stats"><Stat label={user.role === "student" ? "Enrolled courses" : "Active courses"} value={user.role === "student" ? enrollments.length : visible.length} /><Stat label={user.role === "teacher" ? "Your learners" : user.role === "admin" ? "Registered users" : "Completed courses"} value={user.role === "teacher" ? learnerCount : user.role === "admin" ? read(STORAGE_KEYS.users, []).length : enrollments.filter((item) => item.progress === 100).length} /><Stat label="Assignments" value={getAssignments().filter((item) => visible.some((course) => course.id === item.courseId)).length} /></div><div className="section-heading"><h2>{user.role === "teacher" ? "Courses you teach" : "Explore courses"}</h2><NavLink className="text-link" to="/courses">View all →</NavLink></div><div className="card-grid">{visible.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}</div></>;
}

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(() => read(STORAGE_KEYS.courses, []));
  const [modalOpen, setModalOpen] = useState(false);
  const teachers = read(STORAGE_KEYS.users, []).filter((account) => account.role === "teacher");
  const visibleCourses = courses.filter((course) => user.role !== "teacher" || course.teacherId === user.id);
  const createCourse = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teacherId = user.role === "teacher" ? user.id : data.get("teacherId");
    const teacher = teachers.find((account) => account.id === teacherId);
    const next = [...courses, { id: `course-${Date.now()}`, title: data.get("title").trim(), description: data.get("description").trim(), instructor: teacher?.name || user.name, teacherId, lessons: Number(data.get("lessons")), category: data.get("category").trim() || "General" }];
    write(STORAGE_KEYS.courses, next);
    setCourses(next);
    setModalOpen(false);
  };
  return <><div className="section-heading"><div><span className="eyebrow">Learning content</span><h1>{user.role === "admin" ? "Manage courses" : user.role === "teacher" ? "Your courses" : "Course catalogue"}</h1></div>{user.role === "admin" && <Button onClick={() => setModalOpen(true)}>+ Add course</Button>}</div><div className="card-grid">{visibleCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div>{modalOpen && <CourseModal teachers={teachers} onClose={() => setModalOpen(false)} onSubmit={createCourse} />}</>;
}

export function AssignmentsPage() {
  const { user } = useAuth();
  const courses = read(STORAGE_KEYS.courses, []);
  const [assignments, setAssignments] = useState(() => getAssignments());
  const [submissions, setSubmissions] = useState(() => getSubmissions());
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const managedCourses = courses.filter((course) => user.role !== "teacher" || course.teacherId === user.id);
  const visibleAssignments = assignments.filter((assignment) => user.role !== "teacher" || managedCourses.some((course) => course.id === assignment.courseId));
  const createAssignment = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const document = data.get("document");
    const next = addAssignment({
      courseId: data.get("courseId"),
      title: data.get("title").trim(),
      due: data.get("due"),
      points: Number(data.get("points")),
      teacherId: user.id,
      document: document?.size ? document : null,
    });
    setAssignments(next);
    setModalOpen(false);
  };
  const submitAssignment = (event, assignment) => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("submission");
    if (!file?.size) {
      setMessage("Choose a file before submitting.");
      return;
    }
    const next = saveSubmission({
      assignmentId: assignment.id,
      userId: user.id,
      userName: user.name,
      file,
    });
    setSubmissions(next);
    setMessage(`Your work for "${assignment.title}" has been submitted.`);
    event.currentTarget.reset();
  };
  const download = (file, fileName) => {
    if (!file) {
      setMessage("This file is no longer available in page memory. It may have been cleared by a refresh.");
      return;
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || file.name;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <><div className="section-heading"><div><span className="eyebrow">Academic work</span><h1>{user.role === "admin" ? "All assignments" : "Assignments"}</h1></div>{user.role === "teacher" && <Button onClick={() => setModalOpen(true)}>+ Create assignment</Button>}</div><p className="storage-note">Assignments, attached documents, and submissions are kept in page memory only. Refreshing the app clears items created or submitted during this session.</p>{message && <p className="account-message" role="status">{message}</p>}<div className="assignment-list">{visibleAssignments.map((assignment) => {
    const course = courses.find((item) => item.id === assignment.courseId);
    const assignmentSubmissions = submissions.filter((item) => item.assignmentId === assignment.id);
    const ownSubmission = assignmentSubmissions.find((item) => item.userId === user.id);
    return <article className="assignment-card" key={assignment.id}><div className="assignment-icon">✎</div><div className="assignment-content"><span className="eyebrow">{course?.title || "Course"}</span><h3>{assignment.title}</h3><p>Due {assignment.due} · {assignment.points} points</p>{assignment.attachmentName && <button className="file-link" type="button" onClick={() => download(getAssignmentFile(assignment.id), assignment.attachmentName)}>Download assignment document: {assignment.attachmentName}</button>}{user.role === "student" ? <form className="submission-form" onSubmit={(event) => submitAssignment(event, assignment)}><label>Submit your work<input name="submission" type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx" required /></label><Button>{ownSubmission ? "Replace submission" : "Submit assignment"}</Button>{ownSubmission && <span className="tag">Submitted: {ownSubmission.fileName}</span>}</form> : <><span className="tag">{assignmentSubmissions.length} submission{assignmentSubmissions.length === 1 ? "" : "s"}</span>{assignmentSubmissions.length > 0 && <ul className="submission-review">{assignmentSubmissions.map((submission) => <li key={submission.id}><span>{submission.userName} · {submission.fileName}</span><button className="file-link" type="button" onClick={() => download(getSubmissionFile(submission.id), submission.fileName)}>Download</button></li>)}</ul>}</>}</div></article>;
  })}</div>{modalOpen && <AssignmentModal courses={managedCourses} onClose={() => setModalOpen(false)} onSubmit={createAssignment} />}</>;
}

function CourseModal({ teachers, onClose, onSubmit }) {
  return <Modal title="Create a subject" onClose={onClose}><form onSubmit={onSubmit} className="modal-form"><label>Subject name<input name="title" placeholder="e.g. Database Systems" required /></label><label>Description<textarea name="description" rows="3" placeholder="What will students learn?" required /></label><div className="form-grid"><label>Category<input name="category" placeholder="Computer Science" required /></label><label>Lessons<input name="lessons" type="number" min="1" defaultValue="8" required /></label></div><label>Assign teacher<select name="teacherId" required><option value="">Select a teacher</option>{teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</select></label><Button>Create subject</Button></form></Modal>;
}

function AssignmentModal({ courses, onClose, onSubmit }) {
  return <Modal title="Create an assignment" onClose={onClose}><form onSubmit={onSubmit} className="modal-form"><label>Course<select name="courseId" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></label><label>Assignment title<input name="title" placeholder="e.g. Build a responsive landing page" maxLength="100" required /></label><div className="form-grid"><label>Due date<input name="due" type="date" required /></label><label>Points<input name="points" type="number" min="1" max="1000" defaultValue="20" required /></label></div><label>Assignment document (optional)<input name="document" type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx" /></label><p className="storage-note">The document is available to students until this app page is refreshed or closed.</p><Button>Create assignment</Button></form></Modal>;
}

function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>;
}
