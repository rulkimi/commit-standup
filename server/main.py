from fastapi import FastAPI
from github_client import list_repos  # ✅ new function you'll add
from standup_generator import generate_standup
from config import ORG, USERNAME

app = FastAPI()
DEFAULT_REPOS = ["resqmeal-cms", "smfd-cms-3.0", "QBot"]

@app.get("/repos")
def get_repos():
    return {"organization": ORG, "repositories": list_repos()}

@app.post("/generate-standup")
def standup(
    repos: list[str] = DEFAULT_REPOS,
    github_username: str = USERNAME,
    additional_instructions: str = ""
):
    return {"data": generate_standup(repos, github_username, additional_instructions)}

