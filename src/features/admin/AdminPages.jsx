import { useState } from "react";
import { Button } from "../../components/ui.jsx";
import { read, write, STORAGE_KEYS } from "../../services/storage.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AdminPeoplePage() {
  const { signup } = useAuth();
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState(() => read(STORAGE_KEYS.users, []));
  const [links, setLinks] = useState(() => read(STORAGE_KEYS.teacherStudents, []));
  const teachers = users.filter((user) => user.role === "teacher");
  const students = users.filter((user) => user.role === "student");
  const createAccount = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const role = data.get("role");
    const result = signup(data.get("name"), data.get("email"), data.get("password"), role);
    if (result) setMessage(result);
    else {
      setUsers(read(STORAGE_KEYS.users, []));
      setMessage(`${role === "teacher" ? "Teacher" : "Student"} account created.`);
      event.currentTarget.reset();
    }
  };
  const assignStudent = (event) => {
    const studentId = event.target.dataset.student;
    const teacherId = event.target.value;
    const next = [...links.filter((link) => link.studentId !== studentId), ...(teacherId ? [{ studentId, teacherId }] : [])];
    write(STORAGE_KEYS.teacherStudents, next);
    setLinks(next);
  };
  return <><div className="section-heading"><div><span className="eyebrow">Platform administration</span><h1>People and teacher assignments</h1></div></div><div className="admin-columns"><section className="table-card"><h2>Registered users</h2><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Teacher</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><span className="tag">{user.role}</span></td><td>{user.role === "student" ? <select data-student={user.id} value={links.find((link) => link.studentId === user.id)?.teacherId || ""} onChange={assignStudent}><option value="">Unassigned</option>{teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</select> : "—"}</td></tr>)}</tbody></table></section><section className="auth-card"><h2>Provision an account</h2><p>Admins can create university credentials for students and teachers.</p><form onSubmit={createAccount}><label>Account type<select name="role" defaultValue="student"><option value="student">Student</option><option value="teacher">Teacher</option></select></label><label>Full name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" minLength="6" required /></label>{message && <div className="account-message">{message}</div>}<Button>Create account</Button></form></section></div></>;
}
