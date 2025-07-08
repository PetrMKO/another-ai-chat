from fastapi import APIRouter, Depends
from typing import List
import uuid

from configuration.deps import get_chat_service
from dto import MessageResponse, Chat, GenerateMessage, GenerateResponse
from service.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat methods"])

@router.post("/create/{user_id}", response_model=Chat)
async def create_chat(user_id: uuid.UUID, chat_service: ChatService=Depends(get_chat_service)):
    chat = await chat_service.create_chat(user_id)
    return chat

@router.post("/{chat_id}/generate", response_model=GenerateResponse)
async def generate_message(chat_id: uuid.UUID, message: GenerateMessage, chat_service=Depends(get_chat_service)):
    message = await chat_service.generate(chat_id, message)
    return message

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(chat_id: uuid.UUID, chat_service: ChatService=Depends(get_chat_service)):
    messages = await chat_service.get_chat_messages(chat_id)
    return messages
