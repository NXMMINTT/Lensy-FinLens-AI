import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_BASE_URL = os.getenv("KKU_BASE_URL", "https://gen.ai.kku.ac.th/api/v1")
GEMINI_API_KEY = os.getenv("KKU_API_KEY", "")
GEMINI_MODEL = os.getenv("KKU_MODEL", "gemini-3.5-flash-lite")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
ELEVENLABS_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_v3")
