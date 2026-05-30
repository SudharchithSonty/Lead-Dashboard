from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import engine
from app.models import Base
from app.routes.leads import router as leads_router
from app.routes.analytics import router as analytics_router
from app.routes.hubspot_status import router as hubspot_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lead Distribution Portal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}


app.include_router(leads_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(hubspot_router, prefix="/api")
