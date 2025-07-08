from fastapi import APIRouter, Depends, UploadFile, File
import uuid

from configuration.deps import get_rag_service
from service.rag_service import RagService
from dto import Rag as RagDTO

router = APIRouter(prefix="/rag", tags=["Rag methods"])

@router.post("/create/{user_id}")
async def create_rag(user_id: uuid.UUID, rag_service: RagService = Depends(get_rag_service), file: UploadFile = File(...)) -> RagDTO:
    return await rag_service.upload_file(user_id, file)

@router.delete("/delete/{rag_id}")
async def delete_rag(rag_id: uuid.UUID, rag_service: RagService = Depends(get_rag_service)):
    return await rag_service.delete_file(rag_id)

@router.get("/getByUser_id/{user_id}")
async def get_rag_by_user_id(user_id: uuid.UUID, rag_service=Depends(get_rag_service)):
    return await rag_service.get_file_by_user_id(user_id)