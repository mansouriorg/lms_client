This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project checks

- `pnpm lint` runs ESLint.
- `pnpm check:routes` checks that every page file has content, that every internal link (href, router.push, redirect) points to a page that exists, and that no source file of `app`, `components`, `lib` or `services` is empty. It needs no extra package.
- `pnpm check:brand` fails if text from the old templates comes back (driving school, cybersecurity landing page, web-hosting sign-in) or if a price is shown in dollars. It needs no extra package.
- `pnpm test` runs the unit tests with the Node.js test runner (Node 22.18 or newer, no extra package).

To show an error from the API, use `apiErrorMessage(error, fallback)` from `lib/api-error.ts`: it returns the readable `message` the server sends, or the fallback when the server could not be reached.

Prices are shown in Tunisian dinars. Always display a price with `formatPrice()` from `lib/format.ts`: `formatPrice(280)` gives `280 TND`, `formatPrice(212.5)` gives `212.500 TND`. It rounds to the nearest millime first, like the API, so a sum such as `0.2 + 0.7 + 0.1` (0.9999999999999999 in JavaScript) shows `1 TND`.

## Sign-in

- `authService.login()` (services/auth.service.ts) saves the API token and the signed-in user in the browser (localStorage), and `authService.logout()` removes them. `lib/api.ts` sends the token with every request.
- `lib/auth.ts` reads them back: who is signed in, whether the token has expired (the API's tokens last 1 day), and which area an account belongs to: `/center` for academy and platform admins, `/student` for students.
- The `/student` and `/center` layouts call `useAreaSession()` from `lib/use-session.ts`. Signed-out visitors go to the sign-in page and come back to the page they wanted; accounts of the other area go to their own dashboard; the sidebar shows the real name and a working Log out button. Signing out in one tab signs out the other tabs too.
- This only decides which pages to show. The API checks the token and the role on every request, and that is what protects the data.
- Once per page load, `useAreaSession()` also reads the account again (`GET /users/me`). When its role or names changed since sign-in (an academy admin added or removed, a platform admin made from the terminal), the saved user is updated and the right area opens, without signing out. When the API no longer accepts the sign-in (401, for example a deleted account), it signs out. Helpers: `refreshedUser` in `lib/auth.ts` and `apiStatus` in `lib/api-error.ts`, both tested.
- Sign-up (`/auth/register`) creates the account, then signs in with the same details.
- Both pages offer email and password only. The Google and GitHub buttons they used to show did nothing and were removed: signing in with another account would first need that sign-in on the API (OAuth).

## Forgotten passwords

There is no email sending yet: the platform team checks each request and sends the reset link by hand (the API side is in the server README).

- `/auth/forgot-password` (**Forgot password?** on the sign-in page) sends the email (`POST /auth/forgot-password`) and shows the answer, which is the same whether an account uses that email or not, and what happens next: someone checks the request comes from you, then sends a link that works once, for 24 hours.
- `/auth/reset-password?token=...` is the page the link opens: the new password twice (8 to 128 characters, **Show the passwords**), sent with the secret of the link (`POST /auth/reset-password`). Once the password is changed, the secret leaves the address bar and **Sign in** follows. A used or expired link shows why, with **Ask for a new link**; a link without its secret says so. The page sends no Referer to other sites and is not indexed.
- `/center/password-resets` (**Password resets** in the admin menu, shown to platform admins only) lists the resets of the last 30 days (`GET /auth/password-resets`): first the ones waiting for a link, with the email and phone number of each person so you can check the request comes from them. **Create a link** (`POST /auth/password-resets/:id/link`) shows the link once, with **Copy the link** and **Copy a message with the link** (to paste in WhatsApp or an email); a new link replaces the earlier one. **Start a reset** creates a link for the account of an email, for someone who asked another way, by phone for example (`POST /auth/password-resets`). Academy admins who open the page read that only platform admins reset passwords.
- Pieces: `components/auth/` (the frame, both forms), `services/password-reset.service.ts`; the checks and the secret in the address: `lib/password-reset.ts`, tested by `lib/password-reset.test.mjs`; the admin page's labels, link and message: `lib/reset-requests.ts`, tested by `lib/reset-requests.test.mjs`.

## Terms of Service and Privacy Policy

- `/terms` and `/privacy` show the text of `lib/legal.ts`, written for how the platform works today: payment by cash or bank transfer to the academy, what each academy and the platform team can see, no tracking cookie, and the rights given by Tunisian law 2004-63. Both pages use `components/legal/LegalPage.tsx`. A `[label](/path)` in the text becomes a link, and `lib/legal.test.mjs` checks that every such link goes to a real page.
- Accounts are for people aged 18 or older (`LEGAL_MIN_AGE`); the sign-up checkbox says so.
- Sign-up sends the checkbox (`acceptTerms`) and the version of the texts (`termsVersion`, the date `LEGAL_UPDATED`): the API records when and which version each account accepted, and refuses a sign-up from a page that showed another version ("Reload the page and read them again"). When the texts change, change `LEGAL_UPDATED` here and `TERMS_VERSION` in `server/src/config/legal.ts` together: a server test checks that they are the same.
- Signed-in accounts that have not accepted the current version (the accounts from before, and everyone after a change of the texts) see a notice at the top of every page of `/student` and `/center`, with both links (new tab) and **I am 18 or older and I accept** (`POST /users/me/terms`). The notice reads `termsVersion` from `GET /users/me` and shows nothing when that call fails. Pieces: `components/account/TermsNotice.tsx`; its texts: `lib/terms-acceptance.ts`, tested by `lib/terms-acceptance.test.mjs`.
- Before launch: set `LEGAL_CONTACT_EMAIL` (empty: people write to their academy) and `DATA_HOSTING` (empty: the page says the hosting place is not chosen yet), change `LEGAL_UPDATED` with every change of the text, and have the text checked by a lawyer. Tunisian law also asks for a declaration to the INPDP before personal data is collected, and for its authorization to keep data outside Tunisia.

## Orders (admin)

- `/center/orders` lists the orders from `GET /orders/admin/all`: the orders of your academy, or every order for a platform admin. Search by reference, student, email, course or coupon, and filter by status.
- Students pay by cash or bank transfer for now. When the money arrives, click **Mark as paid** on the pending order and confirm. This calls `PATCH /orders/:id/mark-paid`, and the student gets access to what they bought.
- An order with courses from several academies can only be confirmed by a platform admin; the page shows the API's message when this happens.
- The page code is in `app/center/orders/page.tsx`, the API calls in `services/orders.service.ts`, and the calculations (totals, search, labels) in `lib/orders.ts`, tested by `lib/orders.test.mjs`.

## Buying a course (students)

- `/checkout/[id]` (the ID of a course) shows the course and its price. Signed-out visitors are asked to sign in or create an account, and come back to the checkout afterwards.
- **Place order** calls `POST /orders` with the course and the optional coupon code. Nothing is paid online: the page then shows the order reference, the amount and the academy's contact details, and explains how to pay by cash or bank transfer.
- If the student already has an order for the course waiting for payment, the checkout shows that order instead of a new form. If they can already open the course, it says so.
- `/student/orders` (Purchases) lists the student's own orders from `GET /orders/my-orders`, with their status and, once paid, the download links of digital products (only `https://` links are shown).
- Helpers and their tests: `lib/purchases.ts` and `lib/purchases.test.mjs`.

## Store of digital products

- `/store` lists the visible digital products (`GET /products`, open to everyone): title, academy, price and the start of the description. Search by title, topic or academy (accents do not matter), sort by date or price. The header (on wider screens) and the course catalog link to it.
- `/store/[id]` shows a product: its academy (with a link to the academy page), price, description and what the buyer gets. Visitors are asked to sign in; admins are told that students buy. A student places an order for the product (`POST /orders` with `productIds`, optional coupon), then sees the reference, the amount and how to pay the academy. If an order waits for payment, the page shows it instead; once paid, a **Download** button. A hidden or deleted product shows "This product is not available".
- The download link is never on these pages: buyers get it in Purchases (`/student/orders`) once the order is paid. Calls: `services/store.service.ts`; search, sorting and the student's orders of a product: `lib/store.ts`, tested by `lib/store.test.mjs`.

## Course catalog

- `/products` lists the published courses from `GET /stages`, for everyone (no sign-in needed). Search by title, topic, level or academy, pick a category, sort by price.
- `/products/[id]` shows a course: description, academy, program (modules and lessons with their duration) and price. The main button opens the checkout, or says that the student already has access, or asks visitors to sign in for a free course.
- Both pages use `components/layout/CatalogHeader.tsx` (Courses, Academies, Sign in, or My space when signed in), and the catalog cards are `components/catalog/CourseCard.tsx`. The course page links to its academy. Helpers and tests: `lib/catalog.ts` and `lib/catalog.test.mjs`.

## Academies

- `/centers` lists the academies from `GET /centers`, for everyone (no sign-in needed), sorted by name, with their number of published courses. Search by name or city.
- `/centers/[id]` shows one academy (`GET /centers/:id`): its city, its contact email and phone (they open the mail app and the phone), and its published courses. The academy's own admins also see its drafts there, with a **Draft** label.
- The list is in `components/academies/AcademyDirectory.tsx`, the calls in `services/academy.service.ts`, the helpers in `lib/academies.ts`, tested by `lib/academies.test.mjs`.

### Managing the academies (platform admins)

- `/center/academies` (**Academies** in the admin menu, shown to platform admins only) lists every academy (`GET /centers/admin/overview`) with its city, its contact email and phone, its number of courses (drafts included), a link to its public page and its admins. The line under the title counts the academies and the admins, and says how many academies have no admin yet.
- **Create an academy** (`POST /centers`): name, city, contact email and contact phone, all needed and checked like the API before sending. The card of the new academy then opens its **Add an admin** form.
- **Add an admin** takes the email of an existing account: the person signs up first (`POST /centers/:id/admins`). When nobody uses that email, or the account is a platform admin or already an admin of an academy, the API's answer is shown under the field. The app opens the academy space for the new admin the next time they load it (see Sign-in).
- **Remove**, after a confirmation, makes the account a student account again (`DELETE /centers/:id/admins/:userId`).
- **Edit** opens the details of the academy in a form (`PATCH /centers/:id`), checked like the form of a new academy. At its bottom, **Delete the academy** (after a confirmation, `DELETE /centers/:id`) is only offered for an academy without courses, digital products, coupons or admins, like the API allows; otherwise the form says what is left.
- Academy admins who open the page read that only platform admins manage the academies.
- Calls: `services/academy.service.ts`; the form, the messages and the line under the title: `lib/academy-admins.ts`, tested by `lib/academy-admins.test.mjs`.

## My courses and the course player

- `/student/dashboard` (Dashboard) shows the course to continue (the first one in progress, else the first one not started), the numbers (courses, lessons completed, courses finished), the other courses with their progress, and the orders waiting for payment with their reference (`GET /stages/mine`, `GET /orders/my-orders`). Helpers: `courseToContinue`, `courseButtonLabel` and `learningStats` in `lib/learning.ts`.
- Once a course of the student has a final project, the Dashboard also shows **Assignments** (`GET /project-submissions/mine`): how many projects to change and to send, the first 3 of them (changes asked first) and a link to Assignments. Helpers: `assignmentsToDo` and `assignmentsNote` in `lib/assignments.ts`.
- `/student/lessons` (My courses) lists the courses the student bought, from `GET /stages/mine`, with a progress bar and a Start / Continue button.
- `/student/courses/[id]` plays a course: the lesson video, its description, **Mark as completed** (`POST /lessons/:id/complete`), **Next lesson**, and the program with a check mark next to each completed lesson (`GET /lessons/stage/:id/progress`). It starts at the first lesson not completed yet.
- Videos: YouTube and Vimeo links play in their embedded player (YouTube in its privacy-enhanced mode), `.mp4`, `.webm`, `.ogg` and `.mov` files play in the page, other `https://` links open in a new tab. Anything else is not shown (`videoSource` in `lib/learning.ts`, tested by `lib/learning.test.mjs`).
- A student who has not bought the course sees "This course is not open for you yet" with a link to the course page; the API never sends them the video links.

## Academy dashboard

- `/center/dashboard` (Dashboard) is the academy's home. **Needs your attention**: the orders awaiting payment (with their total), the live session requests not answered yet, the student questions with no answer from the academy, and the final projects waiting for a review (with how long the oldest has waited); each card opens the page where it is answered.
- **Your numbers**: the paid sales (the same total as the Orders page) with the part from orders of the last 30 days, the paying students (each counted once) with the new ones, and the courses in the catalog with the drafts.
- **Latest orders** (the 5 newest, any status) and **Your courses** (the 5 with the most paid students).
- Made from the lists of the other admin pages (`GET /orders/admin/all`, `GET /stages/manage`, `GET /bookings/instructor/my-sessions`, `GET /questions/inbox`, `GET /project-submissions/admin/pending`), so its numbers agree with them. A list that cannot be loaded shows a message and **Try again**; the other parts still show. Helpers: `lib/academy-dashboard.ts`, tested by `lib/academy-dashboard.test.mjs`.

## Students (academies)

- `/center/students` (Students) lists everyone who paid for one of the academy's courses (`GET /stages/students`), the newest first: the name, the email (opens the mail app), the phone (calls it), since when, and when they last completed a lesson. Under each student, the courses they bought with a progress bar, "7 of 10 lessons - 70%" and the state: **Not started**, **In progress**, **Finished** or **No lessons yet**.
- Search by name, email, phone or course; filter by course and by progress. **Download CSV** saves the students shown, one line per course (a cell that a spreadsheet would run as a formula starts with an apostrophe).
- Calls: `services/students.service.ts`; states, labels, filters and the CSV: `lib/students.ts`, tested by `lib/students.test.mjs`.

## Lessons (academies)

- `/center/lessons` (Lessons) shows how far the students of a course got (`GET /stages/:id/lesson-progress`): choose a course; the number of students (its buyers, and for a free course the students who completed a lesson), of lessons, and of students who finished every lesson; then each module with its lessons in order, each with a bar and "Completed by 12 of 20 students (60%)".
- A note names the biggest drop: the two lessons in a row where the most students stop. **Edit the lessons** opens the course editor (`/center/stages/[id]`), where lessons are added and changed. Read only.
- Helpers: `lib/lesson-progress.ts`, tested by `lib/lesson-progress.test.mjs`; the call is `courseAdminService.lessonProgress`.

## Course management (academy admins)

- `/center/stages` lists the courses of your academy (every academy for a platform admin) from `GET /stages/manage`: status, price, modules and paid students. Search, filter by status, **Publish** a draft, **Unpublish** a published course nobody bought yet, open it in the catalog, or delete a course that was never ordered.
- `/center/stages/create` creates a course as a draft (`POST /stages`). A platform admin also chooses the academy.
- `/center/stages/[id]` edits the details and the status (`PATCH /stages/:id`) and shows the program. The status help explains who sees the course. Draft and cancelled courses are out of the catalog, Full and Finished ones take no new orders; students who bought a course always keep access (a note says so when a sold course is hidden).
- **Final project (optional)**: what the students of the course build and send as a link to their code (at most 4000 characters, with a counter). It is sent as `projectBrief` with the course; emptying it removes the project. Students see it in Assignments.
- The form fields are in `components/center/CourseDetailsForm.tsx`; the checks (title, price in TND with up to 3 decimals, academy, length of the brief) in `lib/course-admin.ts`, tested by `lib/course-admin.test.mjs`.

## Assignments (students)

- `/student/project-submissions` (**Assignments** in the student menu) lists the final projects of the courses the student bought (`GET /project-submissions/mine`): what to change first, then what to send, what waits for a review, and what is approved. Each card shows what to build, the links sent, the date and the academy's feedback.
- The form sends the link to the code and, if any, to the running site (`POST /project-submissions`): full `https://` addresses, checked like the API does. After "Needs work" the form opens with the links sent, for a new version; a project waiting for review can still get new links; an approved project is final.
- Pieces: `components/student/ProjectCard.tsx`, `services/assignments.service.ts`; states, order, link checks and dates: `lib/assignments.ts`, tested by `lib/assignments.test.mjs`. Only `https://` links are shown as links.
- The student menu shows the number of projects to change or send next to **Assignments**, counted like the Dashboard card (see **Menu numbers** below).

## Projects (academies)

- `/center/projects` (**Projects** in the admin menu) shows what students sent for the final projects of your academy's courses (every academy for a platform admin): **To review** (`GET /project-submissions/admin/pending`, the oldest first) and **Reviewed recently** (`GET /project-submissions/admin/reviewed`, the last 100). Search by student or course.
- Each card shows the student (with their email), the course, when it was sent (or sent again after changes), the links to the code and the site (new tab), what the student had to build, and the last feedback.
- **Approve** or **Ask for changes** (`PATCH /project-submissions/:id/grade`): asking for changes needs feedback (at most 2000 characters, with a counter); the student reads it in Assignments and can send a new version. A reviewed project can be reviewed again (**Change the review**).
- Pieces: `components/center/ProjectReviewCard.tsx`, `services/project-reviews.service.ts`; checks, lists and search: `lib/project-reviews.ts`, tested by `lib/project-reviews.test.mjs`.
- The admin menu shows the number of projects waiting for a review next to **Projects** (see **Menu numbers** below).

## Menu numbers

- The academy menu shows what waits for the academy, counted like the Dashboard: the **Student questions** with no answer from the academy (`GET /questions/inbox`), the **Live sessions** requests to answer (`GET /bookings/instructor/my-sessions`) and the **Projects** waiting for a review (`GET /project-submissions/admin/pending`). The student menu shows the projects to change or send next to **Assignments** (`GET /project-submissions/mine`).
- Nothing is shown when nothing waits, or when a list cannot be loaded; above 99 the menu shows 99+. Screen readers hear the whole sentence, for example "Projects (2 projects waiting for a review)". On phones, a dot on the menu button says that the menu has a number to show.
- The numbers are loaded when the area opens, then again on a page change when the last count is older than 30 seconds (one request per number). A page asks for a new count at once after an answer to a question, a session confirmed, declined or cancelled, a review, or a project sent (the `lms:work-changed` browser event).
- Pieces: `components/ui/WorkBadge.tsx`, `lib/use-work-count.ts`; the texts, the 30 seconds and the event: `lib/work-counts.ts`, tested by `lib/work-counts.test.mjs`.

## Course program (modules and lessons)

- The course editor (`/center/stages/[id]`) edits the program: add, rename, move (arrows) and delete modules; add, edit, move and delete lessons. After each change the program is read again from the API, which numbers modules and lessons.
- A lesson has a title, an optional video link (YouTube, Vimeo, or a video file; the form says what students will see), a length in minutes and notes. After adding a lesson, the form stays open for the next one (**Done** closes it).
- Deleting a module or a lesson also deletes the students' progress and questions on it; the confirmation says so when the course was sold.
- Component: `components/center/ProgramEditor.tsx`; calls: `services/program.service.ts`; checks: `lib/program.ts`, tested by `lib/program.test.mjs`.

## Courses that take no new students

- `closedForOrders(status)` in `lib/catalog.ts`: Full and Finished courses (and courses no longer offered) take no new orders. The course page shows why instead of **Buy this course**, and the checkout shows the same message (the API answers 409).
- Students who bought a course keep access when it is cancelled: it stays in **My courses** with the note "No longer offered by the academy. You keep access."

## Questions under each lesson

- In the course player (`/student/courses/[id]`), under the video: the questions of the lesson (newest first) with their answers. A student asks a question, answers others, and accepts the answer that helped (only the author of the question can); the question is then marked **Resolved**. Answers from the academy have an **Academy** label.
- Only students who can open the course see this panel (the API checks it: `GET /questions/lesson/:lessonId`, `POST /questions`, `POST /questions/reply`, `PATCH /questions/:id/replies/:replyId/accept`).
- Academy admins answer in **Student questions** (`/center/qa`, `GET /questions/inbox`): the questions on their courses, filtered by **Waiting for an answer** (no answer from the academy yet), **Not resolved** or **All**, with a search; they answer as the academy and can mark the accepted answer.
- Component: `components/student/LessonQuestions.tsx`; calls: `services/qa.service.ts`; checks (5 to 150 characters for a title, at most 5000 for a text, like the API): `lib/qa.ts`, tested by `lib/qa.test.mjs`.

## Live sessions (students)

- `/student/bookings` (Live sessions): the student asks an admin of the academy of one of their courses for a mentoring call or a webinar: who (`GET /bookings/instructors`), the topic, the day and the times (`POST /bookings`). The request waits for the academy.
- Upcoming sessions (the soonest first) show the status (**Waiting for the academy**, **Confirmed**), the **Join the meeting** link once confirmed, and **Cancel** (`PATCH /bookings/:id/cancel`, after a confirmation). Past and cancelled sessions are listed below.
- A student without a paid course sees how to get one. Calls: `services/sessions.service.ts`; labels and checks (like the API): `lib/sessions.ts`, tested by `lib/sessions.test.mjs`.

## Live sessions (academies)

- `/center/bookings` (Live sessions): the sessions students asked this admin for (`GET /bookings/instructor/my-sessions`), with the student's email and phone. **Requests to answer** and **Confirmed** sessions to come are listed the soonest first; past and cancelled ones below.
- **Confirm** a request, with the meeting link now or later; **Add the meeting link** or **Change the link** of a confirmed session; **Decline** a request or **Cancel the session** (after a confirmation). All use `PATCH /bookings/:id/status`; the list is loaded again after each answer, since the student may have cancelled in the meantime.
- Calls: `services/academy-sessions.service.ts`; grouping, labels and the link check: `lib/sessions.ts`, tested by `lib/sessions-academy.test.mjs`.

## Digital products (academies)

- `/center/products` (Digital products): the files the academy sells (guides, templates, source code), with their price, whether they are visible in the store, and how many times each was ordered (`GET /products/admin/all`).
- **Add a product** (title, price in TND, link to the file, description; visible now or not), **Edit** it, **Hide from the store** or **Show in the store** (`POST` and `PATCH /products`). A product nobody ordered can be deleted after a confirmation; an ordered one can only be hidden, so its buyers keep their download link.
- Calls: `services/digital-products.service.ts`; form checks (like the API) and labels: `lib/digital-products.ts`, tested by `lib/digital-products.test.mjs`.

## Coupons (academies)

- `/center/coupons` (Coupons): the academy's discount codes (`GET /coupons`), each with its discount, how many paid orders used it, its last day and its state: **Active**, **Paused**, **Ended** or **All uses taken**. **Copy** puts the code in the clipboard.
- **Create a coupon**: a code (3 to 30 letters, digits, `-` or `_`), a percentage or a fixed amount in TND, an optional limit of uses and an optional last day (the code works until the end of that day, in the admin's time zone), active now or not (`POST /coupons`).
- **Pause** or **Resume** a coupon (`PATCH /coupons/:id/toggle`). A coupon no order used can be deleted after a confirmation (`DELETE /coupons/:id`); a used one can only be paused.
- Calls: `services/coupons.service.ts`; states, labels and the form checks (like the API): `lib/coupons.ts`, tested by `lib/coupons.test.mjs`.

## Module quizzes (students)

- In the course player (`/student/courses/[id]`), each module that has quiz questions lists **Quiz: N questions** under its lessons (`_count.quizBank` from `GET /stages/:id`), and after the last lesson of the module **Take the module quiz** opens it in place of the lesson (`components/student/ModuleQuiz.tsx`).
- One question at a time (`GET /quizzes/module/:id` sends them without the right answers): the student chooses an answer and clicks **Check my answer**; the API (`POST /quizzes/questions/:id/check`) says if it is right, with the right answer and its explanation. At the end: the score, which questions were right, **Try again** (loads the quiz again) and **Back to the lessons**.
- The finished quiz is sent to `POST /quizzes/module/:id/attempts`: the server grades the answers again and saves the score, and the quiz says whether it is a new best score (**Try saving again** when the call fails; when the quiz changed meanwhile, **Try again** starts over). Before the first question the quiz shows the best score and the number of attempts; the program shows **Best: N%** next to each quiz the student finished (`GET /quizzes/course/:stageId/results`, loaded after the course).
- `/student/questions` (Quizzes) explains where the quizzes are and links to My courses.
- Calls: `services/practice-quiz.service.ts`; the score and the quiz of each module: `lib/practice-quiz.ts`, tested by `lib/practice-quiz.test.mjs`.

## Quizzes (academies)

- `/center/questions` (Quizzes): choose a course; each of its modules shows its quiz (`GET /quiz-questions/course/:id`): the questions with their kind (**Multiple choice** or **True or false**), difficulty, possible answers, the right one and the explanation.
- **Add a question** to a module, **Edit** or **Delete** one (after a confirmation). A multiple choice question has 2 to 6 different answers (empty fields are left out) and one right answer; a true or false question only needs the right answer. The form checks like the API before sending.
- A course without modules links to its editor; a module has at most 50 questions.
- Calls: `services/quizzes.service.ts`; labels and the form: `lib/quizzes.ts`, tested by `lib/quizzes.test.mjs`.
- `/center/questions/results` (**Results of the students**, linked from the Quizzes page): choose a course; a table shows each student (its buyers, and the students who finished one of its quizzes) with their best score at the quiz of each module (`GET /quiz-questions/course/:id/results`): the percentage (green from 70%, amber from 40%, red below), right answers and attempts, or **Not taken**. The last row gives the average best score of each quiz and how many students took it. Search by name or email; a wide table scrolls sideways inside its frame. **Download CSV** saves the students shown, one line each, with the best score (%) and the attempts at each module quiz (empty when not taken), as `quiz-results-<course>-<date>.csv`. Read only; `lib/quiz-results.ts`, tested by `lib/quiz-results.test.mjs`.

## Settings

- `/student/settings` and `/center/settings` (Settings in both sidebars) show the signed-in user's profile from `GET /users/me`. The first name, last name and phone can be changed (`PATCH /users/me`), not the email. After saving, the sidebar shows the new name at once (`authService.updateStoredUser`).
- **Change your password** (under Sign-in): the current password, the new one twice (`POST /auth/change-password`). The form checks the length and that the two new passwords match; the API checks the current one. The other browsers and devices are then signed out (their next request gets a 401); this browser keeps going with the new token of the answer (`authService.replaceToken`).
- **Sign out everywhere else** (under Sign-in, `components/account/SignOutOthers.tsx`): signs out every other browser and device of the account (`POST /auth/sign-out-others`), for example after signing in on a shared or lost computer. This browser stays signed in with the new token of the answer.
- Component: `components/account/ProfileSettings.tsx`; calls: `services/profile.service.ts`; checks (like the API): `lib/profile.ts`, tested by `lib/profile.test.mjs`.
- Error messages: when the API refuses a form (400), `apiErrorMessage` (`lib/api-error.ts`) shows its list of messages in one line, on every page.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
