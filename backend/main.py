from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from database import db
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from ai.semantic_search import search_products
from ai.recommendation import get_recommendations
from ai.vector_search import vector_search
import google.generativeai as genai
import os

# ==================================================
# LOAD ENV
# ==================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ==================================================
# GEMINI
# ==================================================

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

# ==================================================
# APP
# ==================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# DATABASE COLLECTIONS
# ==================================================

products_collection = db["products"]
users_collection = db["users"]
orders_collection = db["orders"]

# ==================================================
# JWT
# ==================================================

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=24)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# ==================================================
# MODELS
# ==================================================


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    message: str


class OrderRequest(BaseModel):
    user_email: str
    products: list
    total: float


class ReviewRequest(BaseModel):
    reviews: list[str]

# ==================================================
# ROOT
# ==================================================


@app.get("/")
def home():
    return {
        "message": "AI Commerce Backend Running"
    }

# ==================================================
# PRODUCTS API
# ==================================================


@app.get("/products")
def get_products():

    products = list(
        products_collection.find({}, {"_id": 0})
    )

    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):

    product = products_collection.find_one(
        {"id": product_id},
        {"_id": 0}
    )

    if not product:
        return {
            "message": "Product not found"
        }

    return product

# ==================================================
# SIGNUP
# ==================================================


@app.post("/signup")
def signup(request: SignupRequest):

    existing_user = users_collection.find_one(
        {"email": request.email}
    )

    if existing_user:
        return {
            "message": "User already exists"
        }

    user_data = {
        "name": request.name,
        "email": request.email,
        "password": hash_password(request.password)
    }

    users_collection.insert_one(user_data)

    token = create_access_token(
        {"email": request.email}
    )

    return {
        "message": "Signup successful",
        "token": token
    }

# ==================================================
# LOGIN
# ==================================================


@app.post("/login")
def login(request: LoginRequest):

    user = users_collection.find_one(
        {"email": request.email}
    )

    if not user:
        return {
            "message": "Invalid email"
        }

    if not verify_password(
        request.password,
        user["password"]
    ):
        return {
            "message": "Wrong password"
        }

    token = create_access_token(
        {"email": request.email}
    )

    return {
        "message": "Login successful",
        "token": token
    }

# ==================================================
# AI CHATBOT
# ==================================================


@app.post("/chat")
def chat(request: ChatRequest):

    products = list(
        products_collection.find({}, {"_id": 0})
    )

    context = "\n".join([
        f"{p['name']} - ₹{p['price']}"
        for p in products
    ])

    prompt = f"""
    You are an AI shopping assistant.

    Available products:
    {context}

    User Question:
    {request.message}

    Recommend products professionally.
    """

    response = model.generate_content(prompt)

    return {
        "reply": response.text
    }

# ==================================================
# SIMPLE SEARCH
# ==================================================


@app.get("/ai-search")
def ai_search(query: str):

    products = list(
        products_collection.find({}, {"_id": 0})
    )

    matched = []

    for product in products:

        if query.lower() in product["name"].lower():
            matched.append(product)

    return matched

# ==================================================
# SEMANTIC SEARCH
# ==================================================


@app.get("/semantic-search")
def semantic_search(query: str):

    result = search_products(query)

    return {
        "result": result
    }

# ==================================================
# VECTOR SEARCH
# ==================================================


@app.get("/vector-search")
def search_vector(query: str):

    result = vector_search(query)

    return result

# ==================================================
# RECOMMENDATIONS
# ==================================================


@app.get("/recommend")
def recommend():

    recommendations = get_recommendations()

    return recommendations

# ==================================================
# REVIEW SUMMARY
# ==================================================


@app.post("/review-summary")
def review_summary(request: ReviewRequest):

    prompt = f"""
    Summarize these reviews:

    {request.reviews}

    Give concise summary.
    """

    response = model.generate_content(prompt)

    return {
        "summary": response.text
    }

# ==================================================
# PLACE ORDER
# ==================================================


@app.post("/place-order")
def place_order(request: OrderRequest):

    order_data = {
        "user_email": request.user_email,
        "products": request.products,
        "total": request.total,
        "created_at": datetime.utcnow()
    }

    orders_collection.insert_one(order_data)

    return {
        "message": "Order placed successfully"
    }

# ==================================================
# GET ORDERS
# ==================================================


@app.get("/orders")
def get_orders():

    orders = list(
        orders_collection.find({}, {"_id": 0})
    )

    return orders