# LabXam  

A clean, scalable, and real-time web platform that helps students access previous year lab exam questions — organized by semester, subject, year, and evaluation type.

The goal of this project is to eliminate the need to search through scattered WhatsApp messages, PDFs, and shared drives before lab exams by providing a centralized and structured repository.

---

[![CI Status](https://github.com/DivyanshGarg380/LabXam/actions/workflows/ci.yml/badge.svg)](https://github.com/DivyanshGarg380/LabXam/actions)

---

⭐ Rated 4.5/5 from 67+ student feedback submissions

📈 Served 7,000+ visits during peak examination periods

## Project Vision

Students often waste hours searching for reliable lab exam questions. This platform solves that problem by:

- Centralizing question data  
- Making it structured and searchable  
- Enabling real-time updates  
- Supporting scalable growth across semesters and subjects  

---

## Features

- Browse questions seamlessly
- Semester-based selection
- Dynamic subject filtering based on semester
- Evaluation-wise categorization (Midsem, Endsem)
- Date and section tags
- Clean, shareable query-based URLs
- Graceful handling of missing/unavailable data
- Minimal, fast, and responsive UI
- Centralized and scalable database
- Rate limiting for abuse prevention
- Admin dashboard to manage all workflows
- Real-time updates across users
- Secure authentication and access control
- Feedback system
- Users can submit questions and report issues  

---

## Admin Panel

A dedicated admin dashboard allows full control over question management.

### Admin Capabilities

- Add new questions dynamically  
- Select Semester → Subject → Year → Evaluation  
- Real-time updates reflected instantly across the app  
- Protected routes using authentication  
- No need to modify static files manually  
- Review user-submitted questions
- Manage feedback and issue reports

---

## Supabase Integration

The project now uses Supabase as the backend instead of Firebase.

### Supabase Services Used

- **PostgreSQL Database** – Structured relational data storage  
- **Supabase Auth** – Secure admin authentication  
- **Realtime Subscriptions** – Instant UI updates  
- **Row Level Security (RLS)** – Fine-grained access control  

---

## Why Supabase?

- Open-source backend (PostgreSQL-based)  
- Better control over schema and queries  
- Built-in real-time subscriptions  
- Strong security via RLS policies  
- Easier debugging and SQL visibility  
- Scalable for production-level applications  

---

## Database Schema
```
semesters
subjects
questions
```


### Questions Table

Each question record includes:

- id  
- semester_id (FK)  
- subject_id (FK)  
- year  
- evaluation_type  
- question_text  
- created_at (timestamp)  

---

## Row Level Security (RLS)

- Public users → Read-only access to questions  
- Admin users → Insert, update, delete permissions  
- Authentication enforced via Supabase Auth  

---

## Tech Stack

- React + TypeScript  
- Tailwind CSS  
- Supabase
- Firebase for backup :)
---

## Routing Logic

The application uses clean query-based URLs.

Example:
```
/questions?sem=<sem_id>&subject=<subject_id>&year=<year>&eval=<eval_type>
```

### URL Parameters

| Parameter | Description     |
|---------- |-----------------|
| sem       | Semester ID     |
| subject   | Subject ID      |
| year      | Year            |
| eval      | Evaluation type |

---

## Environment Setup

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
 

---

## Getting Started

```bash
npm install
npm run dev
Open http:localhost:8080
```

## Contribution Guidelines
- Fork the repository
- Create a new branch
- Make your changes
- Test thoroughly
- Submit a Pull Request

### BEFORE RAISING A PR: 
Please ensure you do ```npm test```

## LICENCE
This project is open-source and available under the MIT License.

© 2026 Divyansh Garg and Vidhan Sachdeva. All rights reserved.

