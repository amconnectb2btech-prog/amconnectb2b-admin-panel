# AMCONNECTB2B · Admin Panel

A React + Vite + Tailwind admin panel for managing the amconnectb2b.com website.
Backed by Firebase (Auth + Firestore).

## What this controls

- **Custom service / solution pages** at `/solutions/:slug` on the public site
- **Testimonials**, **case studies**
- **Contact form submissions** (read, mark replied, archive, delete)
- **Site content** (contact details, top announcement bar)
- **Settings**: theme picker + per-section feature toggles
- **Admin users**: multi-admin with three roles (Super Admin / Admin / Editor)
- **Analytics**: submission trends and distributions

## Getting started

```bash
npm install
cp .env.example .env       # then fill in your Firebase values
npm run dev                # → http://localhost:5174
```

Build:
```bash
npm run build
npm run preview
```

## Firebase setup

1. Create a Firebase project (or reuse the same project used by the public site).
2. Enable **Authentication → Email/Password**.
3. Enable **Firestore Database** in production mode and deploy the rules from
   `../firebase-backend/firestore.rules`.
4. Copy the web SDK config values into `.env`.
5. Create your first admin user:
   - In the Firebase console, go to **Authentication → Users** and add a user
     by email + password.
   - Copy that user's **UID**.
   - In **Firestore**, create a document at `adminUsers/{uid}` with fields:
     ```json
     {
       "email": "you@amconnectb2b.com",
       "name": "Your Name",
       "role": "super_admin",
       "createdAt": <serverTimestamp>
     }
     ```
6. Sign in at `/login` with that email/password.

## Roles

| Role | Manage admins | Settings | Content | Submissions |
| --- | :---: | :---: | :---: | :---: |
| Super Admin | ✔ | ✔ | ✔ | ✔ |
| Admin | ✖ | ✔ | ✔ | ✔ |
| Editor | ✖ | ✖ | ✔ | view only |

You cannot change your own role or delete yourself — protections built in.

## Inviting more admins

1. Create their auth account in Firebase console (or send them a password reset).
2. In the admin panel, **Admin Users → Invite admin** and enter their email
   and role. Once they sign in, their UID is linked to their `adminUsers` doc.

(For a fully self-service flow you'd add a Cloud Function that mints the
profile on first sign-in — kept manual here so the panel runs on Firebase
free tier with no Cloud Functions needed.)

## Project structure

```
src/
├─ App.jsx                  Routes
├─ main.jsx                 Bootstrap
├─ index.css                Tailwind + utility classes
├─ firebase/
│  ├─ config.js             Firebase init (reads VITE_FIREBASE_* envs)
│  └─ services.js           All Firestore reads/writes
├─ context/
│  └─ AuthContext.jsx       Auth state + role / permission helpers
├─ components/
│  ├─ layout/
│  │  ├─ ProtectedRoute.jsx
│  │  └─ DashboardLayout.jsx
│  └─ ui/                   PageHeader, Modal, Toggle, etc.
└─ pages/                   One page per route
```

## Conventions

- **Permissions:** `useAuth().can('manage_users' | 'manage_settings' | ...)` gates UI.
- **Toasts:** every mutation uses `react-hot-toast` for feedback.
- **Skeletons:** never show empty content while loading — use `Skeleton`,
  `SkeletonRow`, or `SkeletonCard` from `components/ui/LoadingScreen.jsx`.
- **Modals:** `Modal` for editors, `ConfirmDialog` for destructive actions.

## Theming

The admin panel itself uses a neutral canvas/ink palette. The theme picker
in **Settings** changes the **public site**, not this panel.

---

© 2026 AMCONNECTB2B Private Limited
