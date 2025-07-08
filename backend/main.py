from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controller import user_router, config_router, chat_router, rag_router

app = FastAPI(
    title="Corp chat API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,  # Разрешаем передачу credentials (cookies, authorization headers)
    allow_methods=["*"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Include routers
app.include_router(user_router)
app.include_router(config_router)
app.include_router(chat_router)
app.include_router(rag_router)