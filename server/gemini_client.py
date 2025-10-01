from google import genai
from config import GEMINI_API_KEY
from pydantic import BaseModel
from typing import List
import json

class ProjectTasks(BaseModel):
    name: str
    tasks: List[str]

class StandupSummary(BaseModel):
    projects: List[ProjectTasks]

client = None

def init_gemini():
    global client
    if not GEMINI_API_KEY:
        raise Exception("Missing GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_API_KEY)

def get_ai_response(prompt: str):
    if not client:
        print("[DEBUG] client not initialized — calling init_gemini()")
        init_gemini()

    print("[DEBUG] Sending prompt to Gemini:", prompt)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={ "response_schema": StandupSummary }
    )

    print("[DEBUG] Raw response object:", response)

    # Try structured response
    try:
        print("[DEBUG] Attempting to access response.parsed")
        parsed = response.parsed
        print("[DEBUG] Parsed response:", parsed)
        if parsed:
            # Deduplicate tasks
            for project in parsed.projects:
                project.tasks = list(dict.fromkeys(project.tasks))
            return parsed
    except AttributeError:
        print("[WARN] response.parsed not found — falling back to manual parsing")

    # Fallback to text processing
    raw_text = None

    # Some Gemini responses store as `text`, others under content parts
    if hasattr(response, "text") and response.text:
        raw_text = response.text.strip()
    else:
        # Try extract from content parts
        try:
            raw_text = response.candidates[0].content.parts[0].text.strip()
        except:
            raise Exception("[ERROR] Could not extract text from Gemini response")

    print("[DEBUG] response.text:", raw_text)

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        print("[DEBUG] Detected markdown fence, stripping")
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        print("[DEBUG] Cleaned fenced text:", raw_text)

    try:
        parsed_json = json.loads(raw_text)
        print("[DEBUG] Successfully parsed JSON:", parsed_json)

        # Deduplicate manually
        for project in parsed_json.get("projects", []):
            project["tasks"] = list(dict.fromkeys(project["tasks"]))

        return parsed_json
    except Exception as e:
        print("[ERROR] Failed to parse JSON:", e)
        print("[ERROR] Final raw text was:", raw_text)
        raise
