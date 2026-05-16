from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.models import Base
from app.routes import auth, goals, checkins, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AtomQuest Goal Tracker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(goals.router)
app.include_router(checkins.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "AtomQuest API running 🚀"}
