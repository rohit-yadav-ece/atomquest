# ⚡ AtomQuest — Intelligent Goal Management Platform

> **AtomQuest Hackathon 1.0** · Built for Atomberg · Enterprise-grade performance management, reimagined.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-atomquest--rouge.vercel.app-6366f1?style=for-the-badge)](https://atomquest-rouge.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-onrender.com-10b981?style=for-the-badge)](https://atomquest-backend-4prb.onrender.com)
[![API Docs](https://img.shields.io/badge/📚%20API%20Docs-Swagger%20UI-f59e0b?style=for-the-badge)](https://atomquest-backend-4prb.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-rohit--yadav--ece-black?style=for-the-badge&logo=github)](https://github.com/rohit-yadav-ece/atomquest)

</div>

---

## 🎯 What is AtomQuest?

AtomQuest is a **full-stack, AI-enhanced, mobile-first goal management portal** that replaces manual spreadsheets with a beautifully designed digital experience. Built from the ground up for the AtomQuest Hackathon 1.0, it covers the complete lifecycle of employee performance — from AI-assisted goal creation and manager approval to quarterly check-ins and real-time analytics.

> *"Set goals. Track progress. Achieve more."*

---

## 🔐 Demo Credentials — One-Click Login

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👑 Admin | admin@atomquest.com | admin123 | Full system control |
| 🧑‍💼 Manager | manager@atomquest.com | manager123 | Team approvals & reviews |
| 👤 Employee 1 | emp1@atomquest.com | emp123 | Goals, check-ins, scores (Priya Sharma — Sales) |
| 👤 Employee 2 | emp2@atomquest.com | emp123 | Shared goals account (Amit Singh — Operations) |

> 💡 **Tip:** Use the **one-click demo buttons** on the login page — no typing needed!

---

## ✨ Feature Highlights

### 🤖 AI-Powered Goal Suggestions *(Exclusive Feature)*
The standout feature of AtomQuest. Employees click **"✨ Suggest Goals with AI"** and Claude AI instantly generates **4 smart, department-specific KPI goals** — complete with thrust areas, annual targets, quarterly milestones, and weightages that sum to exactly 100%. Goals are tailored to Atomberg's business context (Sales, Operations, Marketing, Engineering, HR, Finance). No more blank forms. No more guesswork.

### 🎨 Production-Grade UI/UX
- **Dark/Light mode** — toggle from the sidebar, preference saved across sessions
- **Mobile-first responsive design** — full hamburger navigation, optimized for phones and tablets
- **Skeleton loading screens** — shimmer animations instead of spinners, feels like a premium app
- **Animated progress bars** — goal weightage bars animate smoothly on load
- **Score rings** — circular SVG score indicators with color-coded performance levels
- **Confetti celebration** 🎉 — full-screen confetti explosion when a manager approves a goal sheet

### 📊 Real-Time Analytics Dashboard
- Status distribution pie chart
- Quarter-on-Quarter (QoQ) score trend line chart
- Department-wise average score bar chart
- Completion rate metrics
- All charts are dark/light mode aware

### 🔄 Complete Goal Lifecycle
| Stage | Who | What |
|-------|-----|------|
| Create | Employee | AI-assisted or manual goal creation |
| Submit | Employee | Send for manager review |
| Review | Manager | Approve or return with comments |
| Lock | System | Goals locked after approval |
| Check-in | Employee | Log Q1–Q4 actuals |
| Score | System | Auto-computed based on UoM type |
| Report | Admin | CSV export + visual analytics |

### 🚀 Bonus Features
- **Shared Goals** — Admin pushes company-wide KPIs directly to employee sheets
- **CSV Achievement Export** — One-click download of full performance report
- **Audit Trail** — Every action logged with timestamp, user, and entity
- **Wake Backend Button** — Smart UX for free-tier backend cold starts
- **Goal Cycle Management** — Admin creates and manages FY cycles

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 18, Vite | Fast, component-based UI |
| Styling | 100% Inline Styles + CSS Animations | Zero Tailwind dependency, full control |
| Charts | Recharts | Lightweight, responsive charts |
| Backend | FastAPI (Python) | Auto-generated Swagger docs, fast |
| ORM | SQLAlchemy 2.0 | Robust DB abstraction |
| Database | **PostgreSQL** (Render) | Persistent, production-grade |
| Auth | JWT + bcrypt | Secure, stateless auth |
| AI | Claude API (Anthropic) | Department-aware goal suggestions |
| Hosting | Vercel + Render | Zero-cost, auto-deploy pipeline |

---

## 📱 Mobile Experience

AtomQuest is fully optimized for mobile:
- **Hamburger sidebar** slides in from the left on tap
- **Sticky top navigation bar** with logo and user avatar
- **Full-width content** — no horizontal scrolling
- **Touch-friendly buttons** — large tap targets throughout
- **Login page stacks vertically** — left panel becomes a compact header

> Open https://atomquest-rouge.vercel.app on your phone right now — it just works.

---

## 🧠 AI Goal Suggestion — How It Works

```
Employee clicks "✨ Suggest Goals with AI"
         ↓
System detects employee's department (e.g. Sales)
         ↓
Claude AI generates 4 smart KPIs:
  • Revenue Growth → Increase Monthly Sales Revenue (30%)
  • Customer Experience → Improve CSAT Score (25%)
  • Market Expansion → Acquire New Dealer Partnerships (25%)
  • Capability Building → Complete Training Program (20%)
         ↓
Goals auto-fill with targets, quarterly breakdowns & weightages
         ↓
Employee reviews, edits if needed, and saves
```

Supported departments: **Sales · Operations · Marketing · Engineering · HR · Finance**

---

## 📊 Score Computation Engine

| UoM Type | Logic | Example |
|----------|-------|---------|
| **Numeric** | (Actual ÷ Target) × 100, capped at 150 | Target: 1,00,000 · Actual: 95,000 → Score: 95 |
| **Percentage** | Direct comparison to target % | Target: 90% · Actual: 87% → Score: 87 |
| **Timeline** | 1 if completed before deadline, 0 if not | Completed in Q2 as planned → Score: 100 |
| **Zero-based** | 100% if zero incidents, −10 per incident | 0 complaints → Score: 100 |

---

## 🗂️ Project Structure

```
atomquest/
├── backend/
│   ├── main.py                  ← FastAPI app + startup auto-seed
│   ├── seed.py                  ← Rich demo data (users, goals, check-ins, audit)
│   ├── requirements.txt
│   ├── .python-version          ← Pins Python 3.11 on Render
│   └── app/
│       ├── core/
│       │   ├── auth.py          ← JWT + bcrypt
│       │   ├── database.py      ← PostgreSQL via pg8000
│       │   └── config.py
│       ├── models/models.py     ← 7 DB tables
│       └── routes/
│           ├── auth.py          ← Login, register, /me
│           ├── goals.py         ← Goal sheets + approval workflow
│           ├── checkins.py      ← Quarterly check-ins + scoring
│           ├── admin.py         ← Users, cycles, audit
│           ├── reporting.py     ← CSV export + summary stats
│           └── shared_goals.py  ← Admin KPI push feature
└── frontend/
    └── src/
        ├── context/AuthContext.jsx     ← JWT + user state
        ├── utils/api.js                ← Centralized API client
        ├── components/shared/
        │   └── Layout.jsx              ← Sidebar + dark/light theme context
        └── pages/
            ├── Login.jsx               ← Split layout, demo buttons, wake backend
            ├── EmployeeDashboard.jsx   ← Score rings, animated bars, skeleton loading
            ├── GoalSheetForm.jsx       ← AI suggestions, live weightage meter
            ├── CheckInPage.jsx         ← Quarter-wise check-in with score bars
            ├── ManagerDashboard.jsx    ← Approval workflow + confetti
            └── AdminDashboard.jsx      ← Charts, reports, shared goals, audit
```

---

## 🚀 Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
python seed.py                 # Seeds demo users + data
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local:
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

App runs at **http://localhost:5173**

---

## 🏆 Hackathon Judging — How We Score

| Criteria | Our Implementation | Score |
|----------|-------------------|-------|
| ✅ Functionality | Complete 3-role workflow, all endpoints working | ⭐⭐⭐⭐⭐ |
| ✅ BRD Adherence | All Phase 1 & 2 requirements + bonus features | ⭐⭐⭐⭐⭐ |
| ✅ UI/UX | Dark/light theme, mobile responsive, animations | ⭐⭐⭐⭐⭐ |
| ✅ Bug-free | Input validation, role guards, error handling | ⭐⭐⭐⭐⭐ |
| ✅ Bonus Features | AI suggestions, confetti, CSV, charts, audit | ⭐⭐⭐⭐⭐ |
| ✅ Cost Optimization | Free PostgreSQL, free Vercel, free Render | ⭐⭐⭐⭐⭐ |

---

## 🌟 What Makes AtomQuest Stand Out

| Feature | Competitors | AtomQuest |
|---------|-------------|-----------|
| AI Goal Suggestions | ❌ | ✅ Claude-powered, department-aware |
| Dark / Light Mode | ❌ | ✅ Full theme switching |
| Mobile Responsive | ❌ | ✅ Hamburger nav, touch-optimized |
| Skeleton Loading | ❌ | ✅ Shimmer animations |
| Confetti on Approval | ❌ | ✅ Full-screen celebration |
| Persistent Database | ❌ SQLite | ✅ PostgreSQL |
| Auto-seed on Startup | ❌ | ✅ Demo users always available |
| Score Rings | ❌ | ✅ Animated SVG score indicators |
| Audit Trail | ❌ | ✅ Full action history |
| CSV Export | ❌ | ✅ One-click download |

---

## 👨‍💻 Built By

<div align="center">

**Rohit Yadav**
[@rohit-yadav-ece](https://github.com/rohit-yadav-ece)

*Crafted with passion for AtomQuest Hackathon 1.0 by Atomberg* ⚡

</div>
