# 🎯 AtomQuest — Goal Setting & Tracking Portal

> Built for **AtomQuest Hackathon 1.0** | Full-stack web application for employee performance management

[![Live Demo](https://img.shields.io/badge/Live%20Demo-atomquest--rouge.vercel.app-6366f1?style=for-the-badge)](https://atomquest-rouge.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-onrender.com-22c55e?style=for-the-badge)](https://atomquest-backend-4prb.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-rohit--yadav--ece-black?style=for-the-badge&logo=github)](https://github.com/rohit-yadav-ece/atomquest)

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://atomquest-rouge.vercel.app |
| ⚙️ Backend API | https://atomquest-backend-4prb.onrender.com |
| 📚 API Docs | https://atomquest-backend-4prb.onrender.com/docs |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@atomquest.com | admin123 |
| Manager | manager@atomquest.com | manager123 |
| Employee | emp1@atomquest.com | emp123 |
| Employee | emp2@atomquest.com | emp123 |

---

## 📋 What It Does

A digital **Goal Setting & Tracking Portal** that replaces manual spreadsheets for employee performance management. Supports the full lifecycle of employee goals — from creation and approval to quarterly check-ins and analytics.

---

## ✨ Features

### Core (Must-Have)
- ✅ **Employee Goal Sheets** — Create goals with Thrust Area, UoM, Targets & Weightage
- ✅ **Validation Rules** — Total weightage = 100%, max 8 goals, min 10% per goal
- ✅ **Manager Approval Workflow** — Review, approve or return goal sheets
- ✅ **Goal Locking** — Goals locked after approval, audit trail for changes
- ✅ **Quarterly Check-ins** — Log actuals vs planned for Q1–Q4
- ✅ **Auto Score Computation** — Based on UoM type (Numeric, %, Timeline, Zero-based)

### Bonus Features
- ✅ **CSV/Excel Export** — Download full achievement report
- ✅ **Dashboard Charts** — Status distribution pie chart, QoQ score trends
- ✅ **Shared Goals** — Admin pushes department KPIs to employee sheets
- ✅ **Audit Trail** — Full log of all changes with timestamps
- ✅ **Analytics** — Avg scores by department, completion rates

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Tailwind CSS + React Router v6 + Recharts |
| Backend | FastAPI (Python) + SQLAlchemy ORM |
| Database | SQLite (local) / PostgreSQL ready |
| Auth | JWT tokens + bcrypt password hashing |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 👥 User Roles

### Employee
- Create and submit goal sheets
- Log quarterly achievements
- View auto-computed scores

### Manager (L1)
- Review and approve/return submitted sheets
- Conduct quarterly check-ins
- Add feedback comments

### Admin/HR
- Configure goal cycles
- Manage users and org hierarchy
- Push shared goals to employees
- View audit logs and reports
- Export achievement data as CSV

---

## 📊 Score Computation

| UoM Type | Formula |
|----------|---------|
| Numeric / % | (Actual ÷ Target) × 100, capped at 150% |
| Timeline | Early completion = bonus, late = penalty |
| Zero-based | 0 occurrences = 100%, each extra = −10% |

---

## 🗂️ Project Structure

```
atomquest/
├── backend/
│   ├── main.py              ← FastAPI entry point
│   ├── requirements.txt
│   ├── seed.py              ← Demo data setup
│   └── app/
│       ├── core/            ← Auth, DB, Config
│       ├── models/          ← 7 database models
│       └── routes/          ← API endpoints
│           ├── auth.py
│           ├── goals.py
│           ├── checkins.py
│           ├── admin.py
│           ├── reporting.py
│           └── shared_goals.py
└── frontend/
    └── src/
        └── pages/
            ├── Login.jsx
            ├── EmployeeDashboard.jsx
            ├── GoalSheetForm.jsx
            ├── CheckInPage.jsx
            ├── ManagerDashboard.jsx
            └── AdminDashboard.jsx
```

---

## 🚀 Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic-settings pydantic[email] bcrypt==4.0.1
python seed.py
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm install recharts
npm run dev
```

App runs at **http://localhost:5173**

---

## 🏆 Hackathon Judging Criteria

| # | Parameter | Implementation |
|---|-----------|---------------|
| 1 | Functionality | Full end-to-end flow for all 3 roles |
| 2 | BRD Adherence | All Phase 1 & 2 requirements implemented |
| 3 | User Friendliness | Clean Tailwind UI, helpful error messages |
| 4 | Bug-free | Validated inputs, role-based access |
| 5 | Bonus Features | Reports, Charts, Shared Goals, Audit |
| 6 | Cost Optimisation | SQLite locally, free tier hosting |

---

## 👨‍💻 Built By

**Rohit Yadav** — [@rohit-yadav-ece](https://github.com/rohit-yadav-ece)

*AtomQuest Hackathon 1.0*
