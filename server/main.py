"""
Vibe Planner API - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import chat, tasks, routines, plans, users
from app.api.websocket import chat_ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("Starting Vibe Planner API...")
    yield
    # Shutdown
    print("Shutting down Vibe Planner API...")


app = FastAPI(
    title="Vibe Planner API",
    description="AI-powered conversational planning assistant API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(routines.router, prefix="/api/v1/routines", tags=["Routines"])
app.include_router(plans.router, prefix="/api/v1/plans", tags=["Plans"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

# WebSocket router
app.include_router(chat_ws.router, prefix="/api/v1/chat", tags=["WebSocket"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Vibe Planner API",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "debug": settings.debug
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
