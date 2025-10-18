from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
from bson import ObjectId
import base64
import uuid
import random
import string

app = FastAPI(title="Security App API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.security_app

# JWT & Password
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ChatCreate(BaseModel):
    contact_name: str
    is_online: bool = False

class ChatUpdate(BaseModel):
    contact_name: Optional[str] = None
    last_message: Optional[str] = None
    time: Optional[str] = None
    unread_count: Optional[int] = None
    is_online: Optional[bool] = None

class MessageCreate(BaseModel):
    chat_id: str
    sender_name: str
    text: str
    is_outgoing: bool
    image_url: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[int] = None

class OrderItem(BaseModel):
    product_name: str
    quantity: int

class OrderCreate(BaseModel):
    order_number: str
    status: str = "processing"  # processing, ready, completed
    items: List[OrderItem]
    total_items: int

class SOSCreate(BaseModel):
    location: Optional[str] = None
    status: str = "sent"  # sent, acknowledged, resolved

# Helper functions
def generate_user_code():
    """Generate a unique 6-character alphanumeric code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = user["_id"]
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# Auth endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "full_name": user.full_name,
        "avatar_url": None,
        "created_date": datetime.utcnow().isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": db_user["_id"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_doc(current_user)

@app.patch("/api/auth/me")
async def update_me(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"_id": current_user["id"]}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": current_user["id"]})
    return serialize_doc(updated_user)

# File upload
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    contents = await file.read()
    file_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    
    # Store in MongoDB as base64
    file_doc = {
        "_id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "data": base64.b64encode(contents).decode("utf-8"),
        "user_id": current_user["id"],
        "created_date": datetime.utcnow().isoformat()
    }
    await db.files.insert_one(file_doc)
    
    file_url = f"/api/files/{file_id}"
    return {"file_url": file_url}

@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    from fastapi.responses import Response
    file_doc = await db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    data = base64.b64decode(file_doc["data"])
    return Response(content=data, media_type=file_doc["content_type"])

# Chats
@app.post("/api/chats")
async def create_chat(chat: ChatCreate, current_user: dict = Depends(get_current_user)):
    chat_id = str(uuid.uuid4())
    chat_doc = {
        "_id": chat_id,
        "user_id": current_user["id"],
        "contact_name": chat.contact_name,
        "is_online": chat.is_online,
        "last_message": "",
        "time": "",
        "unread_count": 0,
        "created_date": datetime.utcnow().isoformat()
    }
    await db.chats.insert_one(chat_doc)
    return serialize_doc(chat_doc)

@app.get("/api/chats")
async def list_chats(current_user: dict = Depends(get_current_user)):
    chats = await db.chats.find({"user_id": current_user["id"]}).sort("created_date", -1).to_list(100)
    return [serialize_doc(chat) for chat in chats]

@app.patch("/api/chats/{chat_id}")
async def update_chat(chat_id: str, update: ChatUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.chats.update_one({"_id": chat_id, "user_id": current_user["id"]}, {"$set": update_data})
    chat = await db.chats.find_one({"_id": chat_id})
    return serialize_doc(chat)

# Messages
@app.post("/api/messages")
async def create_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    message_id = str(uuid.uuid4())
    message_doc = {
        "_id": message_id,
        "chat_id": message.chat_id,
        "sender_name": message.sender_name,
        "text": message.text,
        "is_outgoing": message.is_outgoing,
        "image_url": message.image_url,
        "timestamp": datetime.utcnow().isoformat(),
        "created_date": datetime.utcnow().isoformat()
    }
    await db.messages.insert_one(message_doc)
    return serialize_doc(message_doc)

@app.get("/api/messages")
async def list_messages(chat_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if chat_id:
        query["chat_id"] = chat_id
    messages = await db.messages.find(query).sort("created_date", 1).to_list(1000)
    return [serialize_doc(msg) for msg in messages]

# Tasks
@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    task_doc = {
        "_id": task_id,
        "user_id": current_user["id"],
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "start_time": None,
        "end_time": None,
        "duration": 0,
        "created_date": datetime.utcnow().isoformat()
    }
    await db.tasks.insert_one(task_doc)
    return serialize_doc(task_doc)

@app.get("/api/tasks")
async def list_tasks(current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"user_id": current_user["id"]}).sort("created_date", -1).to_list(100)
    return [serialize_doc(task) for task in tasks]

@app.patch("/api/tasks/{task_id}")
async def update_task(task_id: str, update: TaskUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.tasks.update_one({"_id": task_id, "user_id": current_user["id"]}, {"$set": update_data})
    task = await db.tasks.find_one({"_id": task_id})
    return serialize_doc(task)

# Orders
@app.post("/api/orders")
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    order_doc = {
        "_id": order_id,
        "user_id": current_user["id"],
        "order_number": order.order_number,
        "status": order.status,
        "items": [item.dict() for item in order.items],
        "total_items": order.total_items,
        "created_date": datetime.utcnow().isoformat()
    }
    await db.orders.insert_one(order_doc)
    return serialize_doc(order_doc)

@app.get("/api/orders")
async def list_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}).sort("created_date", -1).to_list(100)
    return [serialize_doc(order) for order in orders]

# SOS
@app.post("/api/sos")
async def create_sos(sos: SOSCreate, current_user: dict = Depends(get_current_user)):
    sos_id = str(uuid.uuid4())
    sos_doc = {
        "_id": sos_id,
        "user_id": current_user["id"],
        "location": sos.location,
        "status": sos.status,
        "created_date": datetime.utcnow().isoformat()
    }
    await db.sos_alerts.insert_one(sos_doc)
    return serialize_doc(sos_doc)

@app.get("/api/sos")
async def list_sos(current_user: dict = Depends(get_current_user)):
    alerts = await db.sos_alerts.find({"user_id": current_user["id"]}).sort("created_date", -1).to_list(100)
    return [serialize_doc(alert) for alert in alerts]

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)