from datetime import datetime, timezone
from gemini_client import get_ai_response
from github_client import fetch_commits, REPO_NAME_MAPPING
from typing import List, Optional

def generate_standup(
    repos: list,
    author: str,
    github_token: str,
    additional_instructions: str = "",
    since: Optional[str] = None,
    until: Optional[str] = None
):
    now = datetime.now(timezone.utc)

    user_provided_range = since is not None or until is not None

    if not since and not until:
        start_iso = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end_iso = now.isoformat()
        date_str = now.strftime("%d %b %Y")
    else:
        start_iso = since or now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end_iso = until or now.isoformat()
        date_str = f"{start_iso} to {end_iso}"

    grouped_commits = {}
    for repo in repos:
        commits = fetch_commits(github_token, repo, start_iso, end_iso, author)
        if commits:
            friendly_name = REPO_NAME_MAPPING.get(repo, repo)
            grouped_commits[friendly_name] = commits

    if not grouped_commits:
        if user_provided_range:
            return { "error": f"No commits found between {date_str}." }
        else:
            return { "error": f"No commits found for {date_str}. Maybe you forgot to push? 😛" }

    prompt = create_prompt(date_str, grouped_commits, additional_instructions=additional_instructions)
    print(prompt)
    return get_ai_response(prompt)


def create_prompt(date_str: str, grouped_commits: dict, output_format: str = "json", additional_instructions: str = "") -> str:
    if output_format == "json":
        format_instruction = """
Output Format (STRICT):
Return ONLY valid JSON matching this schema, with no markdown or code fences:

{
  "projects": [
    {
      "name": "<PROJECT_NAME>",
      "tasks": ["task 1", "task 2"]
    }
  ]
}
"""
    else:
        format_instruction = f"""
Output Format (STRICT — NO EXTRA TEXT OUTSIDE THIS STRUCTURE):

{date_str}:

[RESQMEAL]
- Task line 1
- Task line 2

[SMFD]
- Task line 1
- Task line 2
"""

    extra = f"\nAdditional Instructions:\n{additional_instructions.strip()}\n" if additional_instructions else ""

    prompt = f"""You are an engineer writing a daily standup summary based on Git commits.

Rewrite the raw commit logs below into **concise, descriptive tasks** that:
 - **Keep the original project names EXACTLY as they appear.**
 - Use **past-tense, objective statements**, without "I", "me", or "my".
 - **Do NOT use passive voice. Always use active voice.**
 - Each task must be **a single sentence (8–15 words)**.
 - Clearly describe **what was done, where, and why if implied**.
 - Remove prefixes like "feat:", "chore:", "fix:", or leading dashes.
+ - **If multiple commits describe similar changes in the same area, COMBINE them into a single summarized task.**
 - Do **not** include the project name inside each task (it's already grouped).
 - **ABSOLUTELY NO extra commentary or explanations outside the required format.**
 - **Discord has a hard limit of 2000 characters per message. If the total output would exceed this limit, AUTOMATICALLY SUMMARIZE OR GROUP TASKS instead of listing all of them individually.**
 - **ALWAYS respond in the exact format requested — no variations.**

{extra}

{format_instruction}

RAW COMMITS:
"""

    for project, commits in grouped_commits.items():
        prompt += f"\n[{project}]\n" + "\n".join(commit.strip() for commit in commits)

    return prompt
