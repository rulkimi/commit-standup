import requests
from datetime import datetime, timezone
from config import GITHUB_TOKEN, USERNAME, ORG

headers = {"Authorization": f"token {GITHUB_TOKEN}"}

def list_repos():
    print(f"https://api.github.com/orgs/{ORG}/repos")
    response = requests.get(
        f"https://api.github.com/orgs/{ORG}/repos",
        headers=headers
    ).json()

    if isinstance(response, dict) and response.get("message"):
        return []  # error fallback

    return [r["name"] for r in response]


def list_branches(repo_name: str):
    response = requests.get(
        f"https://api.github.com/repos/{ORG}/{repo_name}/branches",
        headers=headers
    ).json()
    if isinstance(response, dict) and response.get("message"):
        return []
    return [b["name"] for b in response]

def fetch_commits(repo_name: str, start_iso: str, end_iso: str):
    commits = []
    for branch in list_branches(repo_name):
        response = requests.get(
            f"https://api.github.com/repos/{ORG}/{repo_name}/commits",
            headers=headers,
            params={
                "author": USERNAME,
                "since": start_iso,
                "until": end_iso,
                "sha": branch
            }
        ).json()
        if isinstance(response, list):
            commits.extend([c["commit"]["message"].split("\n")[0] for c in response])
    return commits
