let assignments = [];
let submissions = [];
let nextSequence = 0;
const assignmentFiles = new Map();
const submissionFiles = new Map();

export function initializeAssignmentStore(initialAssignments = [], initialSubmissions = []) {
  assignments = [...initialAssignments];
  submissions = [...initialSubmissions];
  nextSequence = 0;
  assignmentFiles.clear();
  submissionFiles.clear();
}

export function getAssignments() {
  return assignments;
}

export function getSubmissions() {
  return submissions;
}

export function createAssignment({ courseId, title, due, points, teacherId, document }) {
  const assignment = {
    id: createId("assignment"),
    courseId,
    title,
    due,
    points,
    teacherId,
    attachmentName: document?.name || null,
  };
  assignments = [...assignments, assignment];
  if (document) assignmentFiles.set(assignment.id, document);
  return assignments;
}

export function saveSubmission({ assignmentId, userId, userName, file }) {
  const existing = submissions.find(
    (submission) => submission.assignmentId === assignmentId && submission.userId === userId,
  );
  const id = existing?.id || createId("submission");
  const submission = {
    id,
    assignmentId,
    userId,
    userName,
    fileName: file.name,
    submittedAt: new Date().toISOString(),
    grade: null,
  };
  submissions = existing
    ? submissions.map((item) => item.id === id ? submission : item)
    : [...submissions, submission];
  submissionFiles.set(id, file);
  return submissions;
}

export function gradeSubmission(submissionId, grade) {
  submissions = submissions.map((submission) => (
    submission.id === submissionId ? { ...submission, grade } : submission
  ));
  return submissions;
}

export function getAssignmentFile(assignmentId) {
  return assignmentFiles.get(assignmentId);
}

export function getSubmissionFile(submissionId) {
  return submissionFiles.get(submissionId);
}

function createId(prefix) {
  nextSequence += 1;
  return `${prefix}-${Date.now()}-${nextSequence}`;
}
