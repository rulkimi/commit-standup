from fastapi import FastAPI
from github_client import list_repos  # ✅ new function you'll add
from standup_generator import generate_standup
from config import ORG

app = FastAPI()

@app.get("/repos")
def get_repos():
    return {"organization": ORG, "repositories": list_repos()}

@app.post("/generate-standup")
def standup(repos: list[str]):
    return {"summary": generate_standup(repos)}
