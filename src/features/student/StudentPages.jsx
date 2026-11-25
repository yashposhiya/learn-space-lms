import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { read, write, STORAGE_KEYS } from "../../services/storage.js";
import {
  createAssignment as addAssignment,
  gradeSubmission,
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
  const visible =
    user.role === "teacher"
      ? courses.filter((course) => course.teacherId === user.id)
      : courses;
  const [allEnrollments, setAllEnrollments] = useState(() =>
    read(STORAGE_KEYS.enrollments, []),
  );
  const enrollments = allEnrollments.filter((item) => item.userId === user.id);
  const learnerCount = allEnrollments.filter((item) =>
    visible.some((course) => course.id === item.courseId),
  ).length;
  return (
    <>
      <section className="welcome">
        <span className="eyebrow">
          {user.role === "admin" ? "Control center" : "Keep moving forward"}
        </span>
        <h1>
          {user.role === "admin"
            ? "Manage the learning community."
            : user.role === "teacher"
              ? "Create meaningful learning experiences."
              : "Your next achievement starts here."}
        </h1>
        <p>Pick up where you left off and make progress today.</p>
      </section>
      <div className="stats">
        <Stat
          label={
            user.role === "student" ? "Enrolled courses" : "Active courses"
          }
          value={user.role === "student" ? enrollments.length : visible.length}
        />
        <Stat
          label={
            user.role === "teacher"
              ? "Your learners"
              : user.role === "admin"
                ? "Registered users"
                : "Completed courses"
          }
          value={
            user.role === "teacher"
              ? learnerCount
              : user.role === "admin"
                ? read(STORAGE_KEYS.users, []).length
                : enrollments.filter((item) => item.progress === 100).length
          }
        />
        <Stat
          label="Assignments"
          value={
            getAssignments().filter((item) =>
              visible.some((course) => course.id === item.courseId),
            ).length
          }
        />
      </div>
      <div className="section-heading">
        <h2>
          {user.role === "teacher" ? "Courses you teach" : "Explore courses"}
        </h2>
        <NavLink className="text-link" to="/courses">
          View all →
        </NavLink>
      </div>
      <div className="card-grid">
        {visible.slice(0, 3).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrollments={allEnrollments}
            onEnrollmentsChange={setAllEnrollments}
          />
        ))}
      </div>
    </>
  );
}

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(() => read(STORAGE_KEYS.courses, []));
  const [enrollments, setEnrollments] = useState(() =>
    read(STORAGE_KEYS.enrollments, []),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const teachers = read(STORAGE_KEYS.users, []).filter(
    (account) => account.role === "teacher",
  );
  const visibleCourses = courses.filter(
    (course) => user.role !== "teacher" || course.teacherId === user.id,
  );
  const createCourse = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teacherId = user.role === "teacher" ? user.id : data.get("teacherId");
    const teacher = teachers.find((account) => account.id === teacherId);
    const next = [
      ...courses,
      {
        id: `course-${Date.now()}`,
        title: data.get("title").trim(),
        description: data.get("description").trim(),
        instructor: teacher?.name || user.name,
        teacherId,
        lessons: Number(data.get("lessons")),
        category: data.get("category").trim() || "General",
      },
    ];
    write(STORAGE_KEYS.courses, next);
    setCourses(next);
    setModalOpen(false);
  };
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Learning content</span>
          <h1>
            {user.role === "admin"
              ? "Manage courses"
              : user.role === "teacher"
                ? "Your courses"
                : "Course catalogue"}
          </h1>
        </div>
        {user.role === "admin" && (
          <Button onClick={() => setModalOpen(true)}>+ Add course</Button>
        )}
      </div>
      <div className="card-grid">
        {visibleCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrollments={enrollments}
            onEnrollmentsChange={setEnrollments}
          />
        ))}
      </div>
      {modalOpen && (
        <CourseModal
          teachers={teachers}
          onClose={() => setModalOpen(false)}
          onSubmit={createCourse}
        />
      )}
    </>
  );
}

export function AssignmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const courses = read(STORAGE_KEYS.courses, []);
  const [assignments, setAssignments] = useState(() => getAssignments());
  const [submissions, setSubmissions] = useState(() => getSubmissions());
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const managedCourses = courses.filter(
    (course) => user.role !== "teacher" || course.teacherId === user.id,
  );
  const visibleAssignments = assignments.filter(
    (assignment) =>
      user.role !== "teacher" ||
      managedCourses.some((course) => course.id === assignment.courseId),
  );
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
    if (!downloadFile(file, fileName)) {
      setMessage(
        "This file is no longer available in page memory. It may have been cleared by a refresh.",
      );
    }
  };
  const openAssignment = (event, assignment) => {
    if (event.target.closest("button, input, a")) return;
    navigate(`/assignments/${assignment.id}/submissions`);
  };
  const openAssignmentFromKeyboard = (event, assignment) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/assignments/${assignment.id}/submissions`);
    }
  };
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Academic work</span>
          <h1>{user.role === "admin" ? "All assignments" : "Assignments"}</h1>
        </div>
        {user.role === "teacher" && (
          <Button onClick={() => setModalOpen(true)}>
            + Create assignment
          </Button>
        )}
      </div>
      <p className="storage-note">
        Assignments, attached documents, and submissions are kept in page memory
        only. Refreshing the app clears items created or submitted during this
        session.
      </p>
      {message && (
        <p className="account-message" role="status">
          {message}
        </p>
      )}
      <div className="assignment-list">
        {visibleAssignments.map((assignment) => {
          const course = courses.find(
            (item) => item.id === assignment.courseId,
          );
          const assignmentSubmissions = submissions.filter(
            (item) => item.assignmentId === assignment.id,
          );
          const ownSubmission = assignmentSubmissions.find(
            (item) => item.userId === user.id,
          );
          const isTeacher = user.role === "teacher";
          return (
            <article
              className={`assignment-card ${isTeacher ? "assignment-card-clickable" : ""}`}
              key={assignment.id}
              onClick={
                isTeacher
                  ? (event) => openAssignment(event, assignment)
                  : undefined
              }
              onKeyDown={
                isTeacher
                  ? (event) => openAssignmentFromKeyboard(event, assignment)
                  : undefined
              }
              role={isTeacher ? "link" : undefined}
              tabIndex={isTeacher ? 0 : undefined}
              aria-label={
                isTeacher
                  ? `Review submissions for ${assignment.title}`
                  : undefined
              }
            >
              <div className="assignment-icon">✎</div>
              <div className="assignment-content">
                <span className="eyebrow">{course?.title || "Course"}</span>
                <h3>{assignment.title}</h3>
                <p>
                  Due {assignment.due} · {assignment.points} points
                </p>
                {assignment.attachmentName && (
                  <button
                    className="file-link"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      download(
                        getAssignmentFile(assignment.id),
                        assignment.attachmentName,
                      );
                    }}
                  >
                    Download assignment document: {assignment.attachmentName}
                  </button>
                )}
                {user.role === "student" ? (
                  <>
                    {ownSubmission && (
                      <>
                        <span className="tag">
                          Submitted: {ownSubmission.fileName}
                        </span>
                        <span className="tag">
                          Grade: {ownSubmission.grade ?? "Not graded"} /{" "}
                          {assignment.points}
                        </span>
                        <button
                          className="file-link"
                          type="button"
                          onClick={() =>
                            download(
                              getSubmissionFile(ownSubmission.id),
                              ownSubmission.fileName,
                            )
                          }
                        >
                          Download your submission
                        </button>
                      </>
                    )}
                    <form
                      className="submission-form"
                      onSubmit={(event) => submitAssignment(event, assignment)}
                    >
                      <label>
                        Submit your work
                        <input
                          name="submission"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
                          required
                        />
                      </label>
                      <Button>
                        {ownSubmission
                          ? "Replace submission"
                          : "Submit assignment"}
                      </Button>
                    </form>
                  </>
                ) : isTeacher ? (
                  <span className="tag">
                    {assignmentSubmissions.length} submission
                    {assignmentSubmissions.length === 1 ? "" : "s"} · Click to
                    review
                  </span>
                ) : (
                  <>
                    <span className="tag">
                      {assignmentSubmissions.length} submission
                      {assignmentSubmissions.length === 1 ? "" : "s"}
                    </span>
                    {assignmentSubmissions.length > 0 && (
                      <ul className="submission-review">
                        {assignmentSubmissions.map((submission) => (
                          <li key={submission.id}>
                            <span>
                              {submission.userName} · {submission.fileName}
                            </span>
                            <button
                              className="file-link"
                              type="button"
                              onClick={() =>
                                download(
                                  getSubmissionFile(submission.id),
                                  submission.fileName,
                                )
                              }
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {modalOpen && (
        <AssignmentModal
          courses={managedCourses}
          onClose={() => setModalOpen(false)}
          onSubmit={createAssignment}
        />
      )}
    </>
  );
}

export function AssignmentSubmissionsPage() {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const assignment = getAssignments().find((item) => item.id === assignmentId);
  const courses = read(STORAGE_KEYS.courses, []);
  const course = courses.find((item) => item.id === assignment?.courseId);
  const [submissions, setSubmissions] = useState(() =>
    getSubmissions().filter((item) => item.assignmentId === assignmentId),
  );
  const [grades, setGrades] = useState(() =>
    Object.fromEntries(
      getSubmissions()
        .filter((item) => item.assignmentId === assignmentId)
        .map((item) => [item.id, item.grade ?? ""]),
    ),
  );
  const [message, setMessage] = useState("");

  if (!assignment) {
    return (
      <section className="table-card">
        <h1>Assignment not found</h1>
        <NavLink className="text-link" to="/assignments">
          Back to assignments
        </NavLink>
      </section>
    );
  }
  if (
    !course ||
    (assignment.teacherId !== user.id && course.teacherId !== user.id)
  ) {
    return (
      <section className="table-card">
        <h1>This assignment isn’t assigned to you.</h1>
        <NavLink className="text-link" to="/assignments">
          Back to assignments
        </NavLink>
      </section>
    );
  }

  const saveGrade = (event, submission) => {
    event.preventDefault();
    const rawGrade = new FormData(event.currentTarget).get("grade");
    const grade = Number(rawGrade);
    if (
      rawGrade === "" ||
      !Number.isFinite(grade) ||
      grade < 0 ||
      grade > assignment.points
    ) {
      setMessage(`Enter a grade from 0 to ${assignment.points}.`);
      return;
    }
    const next = gradeSubmission(submission.id, grade).filter(
      (item) => item.assignmentId === assignmentId,
    );
    setSubmissions(next);
    setGrades((current) => ({ ...current, [submission.id]: grade }));
    setMessage(`Grade saved for ${submission.userName}.`);
  };
  const preview = (file) => {
    const result = openFileInBrowser(file);
    if (result === "missing") {
      setMessage(
        "This file is no longer available in page memory. It may have been cleared by a refresh.",
      );
      return;
    }
    if (result === "unsupported") {
      setMessage(
        "Browser preview is supported for PDF and plain text files. Download this file to open it.",
      );
      return;
    }
    setMessage(
      "Preview opened in a new tab. Download the file if your browser cannot display it.",
    );
  };
  const download = (file, fileName) => {
    if (!downloadFile(file, fileName)) {
      setMessage(
        "This file is no longer available in page memory. It may have been cleared by a refresh.",
      );
    }
  };

  return (
    <>
      <div className="section-heading">
        <div>
          <NavLink className="text-link" to="/assignments">
            ← Assignments
          </NavLink>
          <span className="eyebrow submissions-course">{course.title}</span>
          <h1>{assignment.title}</h1>
        </div>
        <span className="tag">Total: {assignment.points} points</span>
      </div>
      <p className="storage-note">
        Preview is available for browser-supported file types such as PDF.
        Grades and files remain in memory until the app is refreshed or closed.
      </p>
      {message && (
        <p className="account-message" role="status">
          {message}
        </p>
      )}
      <section className="table-card">
        <h2>Student submissions</h2>
        {submissions.length ? (
          <table className="grading-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Uploaded file</th>
                <th>Submitted</th>
                <th>Grade / total</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.userName}</td>
                  <td>
                    <div className="file-actions">
                      <span>{submission.fileName}</span>
                      <button
                        className="file-link"
                        type="button"
                        onClick={() =>
                          preview(getSubmissionFile(submission.id))
                        }
                      >
                        View
                      </button>
                      <button
                        className="file-link"
                        type="button"
                        onClick={() =>
                          download(
                            getSubmissionFile(submission.id),
                            submission.fileName,
                          )
                        }
                      >
                        Download
                      </button>
                    </div>
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                  <td>
                    <form
                      className="grade-form"
                      onSubmit={(event) => saveGrade(event, submission)}
                    >
                      <label>
                        <span className="sr-only">
                          Grade for {submission.userName}
                        </span>
                        <input
                          type="number"
                          name="grade"
                          min="0"
                          max={assignment.points}
                          step="any"
                          value={grades[submission.id] ?? ""}
                          onChange={(event) =>
                            setGrades((current) => ({
                              ...current,
                              [submission.id]: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <span>/ {assignment.points}</span>
                      <Button>Save</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No student submissions yet.</p>
        )}
      </section>
    </>
  );
}

function downloadFile(file, fileName) {
  if (!file) return false;
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function openFileInBrowser(file) {
  if (!file) return "missing";
  if (!["application/pdf", "text/plain"].includes(file.type))
    return "unsupported";
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 300000);
  return "opened";
}

function CourseModal({ teachers, onClose, onSubmit }) {
  return (
    <Modal title="Create a subject" onClose={onClose}>
      <form onSubmit={onSubmit} className="modal-form">
        <label>
          Subject name
          <input name="title" placeholder="e.g. Database Systems" required />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows="3"
            placeholder="What will students learn?"
            required
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <input name="category" placeholder="Computer Science" required />
          </label>
          <label>
            Lessons
            <input
              name="lessons"
              type="number"
              min="1"
              defaultValue="8"
              required
            />
          </label>
        </div>
        <label>
          Assign teacher
          <select name="teacherId" required>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </label>
        <Button>Create subject</Button>
      </form>
    </Modal>
  );
}

function AssignmentModal({ courses, onClose, onSubmit }) {
  return (
    <Modal title="Create an assignment" onClose={onClose}>
      <form onSubmit={onSubmit} className="modal-form">
        <label>
          Course
          <select name="courseId" required>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option value={course.id} key={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assignment title
          <input
            name="title"
            placeholder="e.g. Build a responsive landing page"
            maxLength="100"
            required
          />
        </label>
        <div className="form-grid">
          <label>
            Due date
            <input name="due" type="date" required />
          </label>
          <label>
            Points
            <input
              name="points"
              type="number"
              min="1"
              max="1000"
              defaultValue="20"
              required
            />
          </label>
        </div>
        <label>
          Assignment document (optional)
          <input
            name="document"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
          />
        </label>
        <p className="storage-note">
          The document is available to students until this app page is refreshed
          or closed.
        </p>
        <Button>Create assignment</Button>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
