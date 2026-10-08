# LearnSpace — Learning Management System

LearnSpace is a browser-based Learning Management System (LMS) made as a college frontend project. It gives students one place to discover courses, enroll, record learning progress, and submit assignment file names. Administrators can manage the course catalogue and review student activity.

## Problem statement

Students may have to find course information and keep track of learning activity across separate places. LearnSpace demonstrates a simple centralized interface for course discovery, account access, progress tracking, and basic assignment activity, with a separate area for administrators.

## Project objectives

- Build a responsive LMS interface using only HTML, CSS, and JavaScript.
- Provide separate Student and Admin modules with role-based navigation.
- Implement signup, login, and direct password reset using LocalStorage.
- Let students enroll in courses, update progress, and submit assignment records.
- Let administrators add and remove courses, view registered students, and review submissions.

## Modules and features

### Student module

- Create a student account and log in.
- Reset a password by entering the account email and setting a new password.
- Browse the course catalogue and enroll in a course.
- Mark lessons complete to update progress in 25% steps.
- View enrolled courses and progress from the dashboard.
- Select an assignment file and submit its filename for the demo record.

### Admin module

- Sign in using the seeded demo administrator account.
- Add and remove courses from the catalogue.
- Create course assignments with a title, due date, and points.
- View registered student accounts and their enrollment counts.
- Review student assignment submission records.

## Technology and implementation

- **HTML:** the page shell and individual screen templates under `views/`.
- **CSS:** shared design tokens, layout, feature styles, and responsive rules under `css/`, linked through `styles.css`.
- **JavaScript:** native browser ES modules under `js/` for routing, validation, rendering DOM updates, and feature logic.
- **LocalStorage:** demo accounts, passwords, session, courses, enrollments, and assignment submission records.
- **CSS Grid and Flexbox:** responsive page, dashboard, card, and form layouts.

There is no JavaScript framework, package manager, build step, backend, or database. The `index.html` file loads the app entry point. JavaScript fetches the HTML view templates and updates their DOM elements with data.

## Project structure

```text
index.html                 Main page shell
styles.css                 Imports the CSS files
css/
  base.css                 Design tokens and shared element styles
  public.css               Landing page and public navigation
  auth.css                 Login and signup forms
  layout.css               Authenticated app shell and sidebar
  dashboard.css            Dashboard, courses, and progress cards
  assignments.css          Assignments, tables, modal, and notifications
  responsive.css           Responsive layout rules
views/
  home.html                Public landing page
  auth.html                Signup/login template
  forgot-password.html     Direct password reset form
  dashboard.html           Student dashboard template
  courses.html             Enrolled courses template
  admin.html               Admin course management template
  students.html            Student directory template
  assignments-student.html Student assignment template
  assignments-admin.html   Admin submissions template
  components/              Shared authenticated shell and course form
js/
  app.js                   Startup, hash navigation, and event handling
  data/config.js           LocalStorage keys and starter records
  services/
    storage.js             LocalStorage access and initialization
    views.js               Loads HTML views and mounts the app shell
  components/
    course-card.js         Builds reusable course cards with DOM methods
  modules/
    home.js                Landing page behavior
    auth.js                Signup, login, and password reset
    student.js             Student dashboard and enrollments
    admin.js               Course and student administration
    assignments.js         Student submissions and admin review
  utils/dom.js             Shared navigation and notification helpers
```

## Run locally

Because the app uses native JavaScript modules and fetches separate HTML templates, serve the folder over HTTP instead of opening `index.html` directly.

For example, with Python already available on your computer, open a terminal in the project folder and run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. The Python command only serves the static files; the application itself remains HTML, CSS, and JavaScript.

## Demo administrator login

- **Email:** `admin@college.edu`
- **Password:** `admin123`

The app seeds this administrator and the starter courses the first time it runs. New registrations receive the Student role.

## LocalStorage data

The app stores its demonstration data in the browser under these keys:

| Key | Stored data |
| --- | --- |
| `learnspace_users` | Demo student and admin accounts |
| `learnspace_session` | Currently signed-in user |
| `learnspace_courses` | Course catalogue |
| `learnspace_enrollments` | Student course enrollment and progress |
| `learnspace_assignments` | Starter assignment list |
| `learnspace_submissions` | Submitted assignment filenames and status |

Clear the site's LocalStorage from browser developer tools to reset the demo data.

## Known limitations and future scope

- Passwords are stored in LocalStorage without secure hashing. Password reset is direct and does not verify email ownership. These choices are for demonstration only; real authentication needs a secure backend.
- Assignment submission records the selected filename only. It does not upload or retain file contents.
- Lesson completion is simulated with a progress button; the project does not contain course lessons or online quizzes.
- Discussion forums, certificates, video lessons, notifications, instructor tools, and backend/database integration are future enhancements.

## Presentation walkthrough

1. Open the landing page and explain the LMS problem and purpose.
2. Create a student account, sign in, and enroll in a course.
3. Mark a lesson complete and show progress on the dashboard.
4. Submit an assignment file and explain that only its filename is stored.
5. Log out and sign in with the demo administrator account.
6. Add or remove a course, open Students, and review Submissions.
7. Demonstrate Forgot password from the login page and explain its LocalStorage-only limitation.
