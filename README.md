# Lab Exam Questions Hub

A clean and intuitive web application to help students access previous year lab exam questions, organized semester-wise, subject-wise, and evaluation-wise.

The goal of this project is to eliminate the need to search through scattered WhatsApp messages, PDFs, and shared drives before lab exams.

---

[![CI Status](https://github.com/DivyanshGarg380/LabXam/actions/workflows/ci.yml/badge.svg)](https://github.com/DivyanshGarg380/LabXam/actions)

---

## 🚀 Features

- Semester-based selection
- Subject filtering based on semester
- Evaluation-wise question listing (Midsem, Endsem)
- Graceful handling of unavailable data
- Clean and shareable URLs
- Centralized and scalable question storage
- Minimal and responsive UI
- Rate limited ofc 😈
-  Admin Dashboard
-  Firebase Integration
-  Real-time database updates
-  Secure question management

---

##  Admin Panel

A dedicated **Admin Page** allows dynamic management of questions.

### Admin Capabilities

- Add new questions
- Select Semester → Subject → Year → Evaluation
- Real-time updates across the app
- Protected access using Firebase Authentication

This removes the need to manually edit the static TypeScript data file and enables scalable content management.

---

##  Firebase Integration

The project now uses Firebase as the backend.

### Firebase Services Used

- **Firestore Database** – Stores structured question data  
- **Firebase Authentication** – Secures admin access  
- **Firebase Hosting (optional)** – For deployment  

### Why Firebase?

- Real-time updates
- No backend server maintenance
- Scalable architecture
- Secure access rules
- Easy migration from static data to cloud database

---

##  Firestore Data Structure

```
Semester → Subject → Year → Evaluation → Questions
```

Each question document includes:

- semesterId
- subjectId
- year
- evaluationType
- questionText
- createdAt (timestamp)

---

## Tech Stack

- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide Icons
- Firebase (Firestore + Authentication)

---

## Updated Project Structure
```
src/
├── components/
│   ├── QuestionsPage.tsx
│   ├── QuestionCard.tsx
│   ├── EmptyState.tsx
│   └── AdminForm.tsx
│
├── pages/
│   ├── Index.tsx
│   ├── Questions.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
│
├── lib/
│   └── firebase.ts
│
└── App.tsx
└── Main.tsx
```

---

##  Routing Logic

The application uses clean, query-based URLs.

Example:

```
questions?sem=<sem_name>&subject=<subject_name>&year=<year>&eval=<eval_type>
```

### URL Parameters

| Parameter | Description |
|-----------|------------|
| sem       | Semester ID |
| subject   | Subject ID |
| year      | Year |
| eval      | Evaluation type |

URL parameters are internally mapped to user-friendly labels before rendering.

---

##  Firebase Setup (For Contributors)

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Add environment variables

Create a `.env` file:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🧪 Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Open in browser

```
http://localhost:8080
```

---

## Before Raising a PR

```bash
npm test
```
