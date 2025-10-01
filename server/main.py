from fastapi import FastAPI, Body
from typing import List
from fastapi.middleware.cors import CORSMiddleware  # ✅ CORS middleware
from github_client import list_repos  # ✅ new function you'll add
from standup_generator import generate_standup
from config import ORG

app = FastAPI()

# ✅ Allow frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["GET", "POST"],   # or restrict to ["GET", "POST"]
    allow_headers=["*"],
)

DEFAULT_REPOS = ["resqmeal-cms", "smfd-cms-3.0", "QBot"]

@app.get("/repos")
def get_repos(github_token: str):
    return {"organization": ORG, "repositories": list_repos(github_token)}

@app.post("/generate-standup")
def standup(
    repos: List[str] = Body(DEFAULT_REPOS),
    github_username: str = Body(""),
    github_token: str = Body(""),
    additional_instructions: str = Body("")
):
    return {"data": generate_standup(repos, github_username, github_token, additional_instructions)}

