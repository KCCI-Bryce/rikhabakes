from pydantic import BaseModel

class SubscriberBase(BaseModel):
    email: str

class SubscriberCreate(SubscriberBase):
    pass

class Subscriber(SubscriberBase):
    id: int

    class Config:
        from_attributes = True
