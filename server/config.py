import os
from dotenv import load_dotenv

load_dotenv()

ORG = os.getenv("GITHUB_ORG")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
