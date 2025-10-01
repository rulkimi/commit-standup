import requests
from datetime import datetime, timezone
from config import ORG

# Mapping from raw repo names to friendly project names
REPO_NAME_MAPPING = {
    "FeedApp": "Feed App",
    "Qbeepmy": "Qbeep My",
    "images": "Image Service",
    "qbeep-loyalty": "Qbeep Loyalty Core",
    "Loyalty": "Loyalty System",
    "Qbeep-loyalty-App-Original-Code-Outsource-": "Qbeep Loyalty App (Original)",
    "Qbeep-Loyalty-App-Dev": "Qbeep Loyalty App (Dev)",
    "Mall-PC": "Mall PC Dashboard",
    "Qbeep-Loyalty-App-Production": "Qbeep Loyalty App (Production)",
    "MF3-Private-Channel-App-Dev": "MF3 Private Channel App (Dev)",
    "android": "Android App",
    "smfd-api": "SMFD API",
    "smfd-mobile": "SMFD Mobile App",
    "smfd-cms": "SMFD CMS",
    "paper-generator": "Paper Generator",
    "sms": "SMS Service",
    "swift-learning": "Swift Learning Project",
    "resQmeals-user": "ResQmeals User App",
    "resqmeal-cms": "ResQmeal CMS",
    "resqmeal-api": "ResQmeal API",
    "resQMeal-merchant": "ResQmeal Merchant App",
    "smfd-bruno-api": "SMFD Bruno API",
    "QBeep_AI": "QBeep AI",
    "smfd-new-cms": "SMFD New CMS",
    "qbeep-dev-bot": "Qbeep Dev Bot",
    "smfd-cms-3.0": "SMFD CMS",
    "QBot": "QBot"
}

def get_headers(token: str):
    return {"Authorization": f"token {token}"}

def list_repos(github_token: str):
    print(f"https://api.github.com/orgs/{ORG}/repos")
    response = requests.get(
        f"https://api.github.com/orgs/{ORG}/repos",
        headers=get_headers(github_token)
    ).json()

    if isinstance(response, dict) and response.get("message"):
        return []  # error fallback

    return [r["name"] for r in response]


def list_branches(github_token: str, repo_name: str):
    response = requests.get(
        f"https://api.github.com/repos/{ORG}/{repo_name}/branches",
        headers=get_headers(github_token)
    ).json()
    if isinstance(response, dict) and response.get("message"):
        return []
    return [b["name"] for b in response]

def fetch_commits(github_token, repo_name: str, start_iso: str, end_iso: str, author: str):
    commits = []
    for branch in list_branches(github_token, repo_name):
        response = requests.get(
            f"https://api.github.com/repos/{ORG}/{repo_name}/commits",
            headers=get_headers(github_token),
            params={
                "author": author,
                "since": start_iso,
                "until": end_iso,
                "sha": branch
            }
        ).json()
        if isinstance(response, list):
            commits.extend([c["commit"]["message"].split("\n")[0] for c in response])
    return commits
