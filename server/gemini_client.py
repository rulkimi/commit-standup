from google import genai
from config import GEMINI_API_KEY

client = None

def init_gemini():
    global client
    if not GEMINI_API_KEY:
        raise Exception("Missing GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_API_KEY)

def get_ai_response(prompt: str):
    if not client:
        init_gemini()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text
