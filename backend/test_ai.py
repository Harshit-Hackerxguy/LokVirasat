import json
from google import genai
from google.genai import types
from config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
chat = client.chats.create(model="gemini-3.6-flash", config=types.GenerateContentConfig(response_mime_type="application/json"))
try:
    response = chat.send_message("Hello")
    print(response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
