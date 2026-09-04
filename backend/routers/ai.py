import json
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

from config import settings

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)

# Configure Gemini Client
client = None
if settings.GEMINI_API_KEY:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Define schemas
class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

SYSTEM_INSTRUCTION = """
You are the Lok-Virasat AI Heritage Assistant, an expert on India's cultural heritage.
You MUST follow these strict rules:
1. Provide accurate, culturally sensitive information.
2. ALWAYS support your claims by citing sources. You can use types like "Community photograph", "Oral account", or "Historical document".
3. Assign a verification status to your answer. Usually this should be "Evidence Supported" if you are confident.
4. You MUST be multilingual. If the user asks in Tamil, Hindi, or any other Indian language, you MUST respond in that exact language. For example, if asked in Tamil "இந்த கோவிலின் சிறப்பு என்ன?", answer entirely in Tamil.

Provide your output EXACTLY in the following JSON format:
{
  "text": "The main response text (in the same language as the user's query).",
  "sources": [
    {
      "type": "Community photograph" | "Oral account" | "Historical document",
      "description": "A brief description of the source you are citing."
    }
  ],
  "verification_status": "Evidence Supported" | "Requires Verification" | "Unverified"
}
"""

@router.post("/chat")
async def chat_with_heritage_ai(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    try:
        # Prepare chat history for the API
        history = []
        for msg in request.messages[:-1]:  # all but the latest
            role = "user" if msg.role == "user" else "model"
            history.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.text)]))
            
        chat = client.chats.create(
            model="gemini-3.6-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
            ),
            history=history
        )
        
        # The latest message
        latest_msg = request.messages[-1].text
        
        response = chat.send_message(latest_msg)
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        print("Error calling Gemini API:", str(e))
        raise HTTPException(status_code=500, detail="Failed to get AI response")
