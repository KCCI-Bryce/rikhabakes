from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rikhabakes API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/subscribe", response_model=schemas.Subscriber)
def subscribe(subscriber: schemas.SubscriberCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Subscriber).filter(models.Subscriber.email == subscriber.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_sub = models.Subscriber(email=subscriber.email)
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    if not products:
        return [
            {"id": 1, "name": "Classic Croissant", "price": "₱200", "image_url": "https://images.unsplash.com/photo-1555507036-ab1f40ce88f4?auto=format&fit=crop&w=400&q=80"},
            {"id": 2, "name": "Sourdough Loaf", "price": "₱250", "image_url": "https://images.unsplash.com/photo-1585478259715-876a6a81fa08?auto=format&fit=crop&w=400&q=80"},
            {"id": 3, "name": "Almond Tart", "price": "₱200", "image_url": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80"}
        ]
    return products
