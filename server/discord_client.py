import requests
from config import DISCORD_WEBHOOK

def send_discord_message(content: str, username: str = "Standup Bot", avatar_url: str = "https://img.icons8.com/?size=100&id=XVxw8dSONRAT&format=png&color=000000"):
    payload = {
        "content": content,
        "username": username
    }
    if avatar_url:
        payload["avatar_url"] = avatar_url

    response = requests.post(DISCORD_WEBHOOK, json=payload)
    
    if response.status_code not in (200, 204):
        raise Exception(f"Discord webhook failed: {response.text}")

    return True
