import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
USERNAME = os.getenv("GITHUB_USERNAME")
ORG = os.getenv("GITHUB_ORG")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
