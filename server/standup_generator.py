from datetime import datetime, timezone
from gemini_client import get_ai_response
from github_client import fetch_commits

def generate_standup(repos: list):
    today = datetime.now(timezone.utc)
    date_str = today.strftime("%d %b %Y")
    start_iso = today.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    end_iso = today.isoformat()

    grouped_commits = {}

    for repo in repos:
        commits = fetch_commits(repo, start_iso, end_iso)
        if commits:
            grouped_commits[repo.upper()] = commits

    if not grouped_commits:
        return "No commits today."

    prompt = create_prompt(date_str, grouped_commits)
    return get_ai_response(prompt)

def create_prompt(date_str: str, grouped_commits: dict):
    base = f"{date_str}:\n"
    for repo, commits in grouped_commits.items():
        base += f"\n{repo}\n" + "\n".join(commits)
    return base
