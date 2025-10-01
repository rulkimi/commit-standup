from datetime import datetime, timezone
from gemini_client import get_ai_response
from github_client import fetch_commits, REPO_NAME_MAPPING

def generate_standup(repos: list, author: str, github_token, additional_instructions: str = ""):
    today = datetime.now(timezone.utc)
    date_str = today.strftime("%d %b %Y")
    start_iso = today.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    end_iso = today.isoformat()

    grouped_commits = {}

    for repo in repos:
        commits = fetch_commits(github_token, repo, start_iso, end_iso, author)
        if commits:
            friendly_name = REPO_NAME_MAPPING.get(repo, repo)
            grouped_commits[friendly_name] = commits

    if not grouped_commits:
        return "No commits today."

    prompt = create_prompt(date_str, grouped_commits, additional_instructions=additional_instructions)
    return get_ai_response(prompt)


def create_prompt(date_str: str, grouped_commits: dict, output_format: str = "json", additional_instructions: str = "") -> str:
    format_instruction = """
Output Format:
Return the summary as pure structured JSON with this schema:

{
  "projects": [
    {
      "name": "<PROJECT_NAME>",
      "tasks": ["task 1", "task 2"]
    }
  ]
}

Ensure valid JSON. Do not wrap it in markdown or code blocks.
""" if output_format == "json" else f"""
Format EXACTLY like this:

{date_str}:

[RESQMEAL]
- Task line 1
- Task line 2

[SMFD]
- Task line 1
- Task line 2
"""

    # Append user-provided instructions only if not empty
    extra = f"\nAdditional Instructions:\n{additional_instructions}\n" if additional_instructions else ""

    prompt = f"""
You are an engineer writing a daily standup summary based on Git commits.

Rewrite the raw commit logs below into **concise, descriptive tasks** that:
- **Keep the original project names EXACTLY as they appear.**
- Are phrased as completed work, **without using "I", "me", or "my"**.
- Each task should be **one full sentence**, roughly **8–15 words**.
- Clearly mention **what was done, where, and for what purpose if implied**.
  - Example: "Added input validation to registration endpoint to prevent empty fields"
  - Example: "Refactored checkout service to reduce duplicate network calls"
- Avoid overly short phrases like "Fixed bug" or overly long explanations.
- Remove prefixes like "feat:", "chore:", "fix:", or leading dashes.
- No opinions, no filler — only **factual work done**.
- Do not mention the repo/project name already inside the task

{extra}

{format_instruction}

RAW COMMITS:
"""

    for project, commits in grouped_commits.items():
        prompt += f"\n[{project}]\n" + "\n".join(commits)

    return prompt



