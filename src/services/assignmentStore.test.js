import { beforeEach, describe, expect, it } from "vitest";
import {
  createAssignment,
  gradeSubmission,
  getAssignmentFile,
  getAssignments,
  getSubmissionFile,
  getSubmissions,
  initializeAssignmentStore,
  saveSubmission,
} from "./assignmentStore.js";

describe("in-memory assignment store", () => {
  beforeEach(() => initializeAssignmentStore());

  it("keeps assignment documents available to the student workspace", () => {
    const document = { name: "project-brief.pdf" };
    const [assignment] = createAssignment({
      courseId: "web",
      title: "Project",
      due: "2026-12-10",
      points: 20,
      teacherId: "teacher-1",
      document,
    });

    expect(getAssignments()).toContain(assignment);
    expect(assignment.attachmentName).toBe("project-brief.pdf");
    expect(getAssignmentFile(assignment.id)).toBe(document);
  });

  it("stores and replaces a student's submission in memory", () => {
    const file = { name: "work.pdf" };
    const [submission] = saveSubmission({
      assignmentId: "a1",
      userId: "student-1",
      userName: "Student One",
      file,
    });
    gradeSubmission(submission.id, 15);
    const replacement = { name: "updated-work.pdf" };

    const next = saveSubmission({
      assignmentId: "a1",
      userId: "student-1",
      userName: "Student One",
      file: replacement,
    });

    expect(next).toHaveLength(1);
    expect(getSubmissions()[0].id).toBe(submission.id);
    expect(getSubmissions()[0].fileName).toBe("updated-work.pdf");
    expect(getSubmissions()[0].grade).toBeNull();
    expect(getSubmissionFile(submission.id)).toBe(replacement);
  });

  it("stores a teacher's grade on the student's submission", () => {
    const [submission] = saveSubmission({
      assignmentId: "a1",
      userId: "student-1",
      userName: "Student One",
      file: { name: "work.pdf" },
    });

    gradeSubmission(submission.id, 18);

    expect(getSubmissions()[0].grade).toBe(18);
  });
});
