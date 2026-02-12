# Lab Exam Questions Hub

A clean and intuitive web application to help students access previous year lab exam questions, organized semester-wise, subject-wise, and evaluation-wise.

The goal of this project is to eliminate the need to search through scattered WhatsApp messages, PDFs, and shared drives before lab exams.

---

![CI](https://github.com/DivyanshGarg380/LabXam/actions/workflows/ci.yml/badge.svg)

## Features

- Semester-based selection
- Subject filtering based on semester
- Evaluation-wise question listing (Midsem, Endsem)
- Graceful handling of unavailable data
- Clean and shareable URLs
- Centralized and scalable question storage
- Minimal and responsive UI

---

## Tech Stack

- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide Icons

---

## Project Structure

```
src/
├── components/
│ ├── QuestionsPage.tsx
│ ├── QuestionCard.tsx
│ └── EmptyState.tsx
│
├── data/
│ ├── questions.ts
│
├── pages/
│ ├── Index.tsx
│ ├── Questions.tsx
│ └── NotFound.tsx
│
└── App.tsx
└── Main.tsx
```

---

## Routing Logic

The application uses clean, query-based URLs.

Example: ``` questions?sem=<sem_name>&subject=<subject_name>&year=<year>&eval=<eval_type> ```

### URL Parameters

| Parameter | Description |
|---------|------------|
| `sem` | Semester ID |
| `subject` | Subject ID |
| `year` | Year |
| `eval` | Evaluation type |

URL parameters are mapped internally to user-friendly labels before rendering.

---

## Data Handling

All questions are stored in a centralized TypeScript file using the following hierarchy:

``` Semester → Subject → Year → Evaluation → Questions ```

This approach:
- Keeps the application lightweight
- Avoids premature backend complexity
- Allows easy migration to an API or database later

---

## Getting Started

### Install dependencies
```bash
npm install
```
### Run the development server
```
npm run dev
```
### Open in browser
```
http://localhost:8080
```
