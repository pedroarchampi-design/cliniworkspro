from fastapi import FastAPI
from .database import init_db
from .web.routes import router

app = FastAPI(title='Sonora Python-first')
app.include_router(router)

@app.on_event('startup')
def on_startup():
    init_db()
