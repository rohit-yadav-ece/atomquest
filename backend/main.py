from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.models import Base
from app.routes import auth, goals, checkins, admin, reporting, shared_goals
from seed import seed_db

@app.on_event("startup")
def on_startup():
    seed_db()


Base.metadata.create_all(bind=engine)

app = FastAPI(title="AtomQuest Goal Tracker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
   allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(goals.router)
app.include_router(checkins.router)
app.include_router(admin.router)
app.include_router(reporting.router)
app.include_router(shared_goals.router)

@app.get("/")
def root():
    return {"message": "AtomQuest API running 🚀"}
