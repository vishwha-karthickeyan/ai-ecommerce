from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from database import db
from datetime import datetime, timedelta
from jose import jwt
from jose import JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from ai.semantic_search import search_products
from ai.recommendation import get_recommendations
from ai.vector_search import vector_search
from google import genai
import os
import json
from pathlib import Path
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# ==================================================
# LOAD ENV
# ==================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GENAI_MODEL = os.getenv("GENAI_MODEL", "")

# ==================================================
# GENERATIVE AI
# ==================================================


def discover_model():
    """Choose a model name string to use with the `google.genai` client.

    Prefers `GENAI_MODEL` env override; otherwise lists models via
    `client.models.list()` and picks a Gemini flash/pro-like candidate.
    """
    # Prefer the environment override if provided
    if GENAI_MODEL:
        return GENAI_MODEL

    # If a genai client is available, list models and prefer Gemini flash/pro variants
    try:
        if client is not None:
            for m in client.models.list():
                name = getattr(m, "name", None)
                if not name:
                    continue
                if "flash" in name or "pro" in name or "gemini" in name:
                    return name
            for m in client.models.list():
                return getattr(m, "name", None)
    except Exception:
        pass

    # last-resort hardcoded candidate
    return "models/gemini-2.5-flash"


if GEMINI_API_KEY:
    # Create genai client using API key
    try:
        key = GEMINI_API_KEY
        if key.startswith('"') and key.endswith('"'):
            key = key[1:-1]
        client = genai.Client(api_key=key)
        print("Created google.genai client")
    except Exception:
        import traceback

        print("Failed to create genai.Client:")
        traceback.print_exc()
        client = None

    # Select model name
    try:
        selected_model = GENAI_MODEL or discover_model()
        print(f"Selected model: {selected_model}")
    except Exception:
        selected_model = None
else:
    client = None
    selected_model = None


def generate_text(prompt: str, products: list | None = None) -> str:
    """Generate text using the configured model, or fall back to simple rule-based output.

    If the model is not available or the call fails, a safe fallback is returned.
    When `products` is provided (list of product dicts), the fallback will include
    simple product recommendations derived from that list.
    """
    if client and selected_model:
        try:
            resp = client.responses.create(model=selected_model, input=prompt)

            # Prefer easy output text if present
            if hasattr(resp, "output_text") and resp.output_text:
                return resp.output_text

            # Otherwise extract structured output
            try:
                parts = []
                for out in getattr(resp, "output", []):
                    for c in getattr(out, "content", []):
                        if hasattr(c, "text") and c.text:
                            parts.append(c.text)
                        elif isinstance(c, dict) and c.get("text"):
                            parts.append(c.get("text"))
                if parts:
                    return "\n".join(parts)
            except Exception:
                pass
        except Exception:
            import traceback

            print("genai client call failed:")
            traceback.print_exc()

            # Fall through to rule-based fallback below

    # No model or model call failed — provide a deterministic fallback
    if products and len(products) > 0:
        # Pick up to 3 top products by price as a simple recommendation strategy
        try:
            sorted_products = sorted(products, key=lambda p: p.get("price", 0), reverse=True)
            picks = sorted_products[:3]
            rec_lines = [f"{p['name']} — ₹{p.get('price', 'N/A')}" for p in picks]
            return (
                "I couldn't reach the AI assistant, but here are some recommended products:\n"
                + "\n".join(rec_lines)
            )
        except Exception:
            pass

    return (
        "The AI assistant is temporarily unavailable. "
        "Please try again later or ask for product recommendations manually."
    )

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


def load_sample_data() -> None:
    if products_collection.count_documents({}) == 0:
        sample_file = Path(__file__).resolve().parent / "data" / "sample_products.json"
        if sample_file.exists():
            with sample_file.open("r", encoding="utf-8") as f:
                products = json.load(f)

            if products:
                products_collection.insert_many(products)


@app.on_event("startup")
def startup_event():
    load_sample_data()


# ==================================================
# JWT
# ==================================================

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
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


# Simple HTTP bearer security for protecting endpoints
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    email = payload.get("email")

    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = users_collection.find_one({"email": email}, {"_id": 0})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user

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
def get_products(search: str | None = None):
    query = {}

    if search:
        query = {
            "name": {
                "$regex": search,
                "$options": "i"
            }
        }

    products = list(
        products_collection.find(query, {"_id": 0})
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

    reply = generate_text(prompt, products)

    return {
        "reply": reply
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

    summary = generate_text(prompt)

    return {
        "summary": summary
    }

# ==================================================
# PLACE ORDER
# ==================================================


@app.post("/place-order")
def place_order(request: OrderRequest, current_user: dict = Depends(get_current_user)):

    # Prefer authenticated user email over client-provided value
    user_email = current_user.get("email")

    order_data = {
        "user_email": user_email,
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
def get_orders(user_email: str | None = None, current_user: dict = Depends(get_current_user)):

    # Only allow users to fetch their own orders unless explicit admin logic is added
    query = {}

    if user_email and user_email != current_user.get("email"):
        # prevent users from fetching other users' orders
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # default to the authenticated user's email
    query["user_email"] = current_user.get("email")

    orders = list(
        orders_collection.find(query, {"_id": 0})
    )

    return orders