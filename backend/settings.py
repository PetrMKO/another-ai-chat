import os

from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DATABASE_URL=os.getenv("DATABASE_URL")
COLLECTION_NAME='chat_files'
CHUNK_SIZE=1200
CHUNK_OVERLAP=120
TOP_K=10

RAG_CONTEXT_ADDITION='\n На все вопросы отвечай, отталкиваясь от контекста, представленного ниже:\n'