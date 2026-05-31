# AI Ecommerce

A simple AI-powered ecommerce platform with a Next.js frontend and a FastAPI backend. The backend includes product listing, authentication, AI chatbot support, semantic and vector search, product recommendations, order placement, and review summarization.

## Project Structure

- `frontend/` - Next.js application for the UI
- `backend/` - FastAPI backend service
- `backend/ai/` - AI helper modules for search and recommendations
- `backend/data/sample_products.json` - sample product data

## Features

- Browse products
- Product detail view
- User signup and login
- AI chatbot for shopping assistance
- Simple keyword search
- Semantic search using sentence transformers
- Vector search and product recommendations
- Order placement and order listing
- Review summarization with Gemini API

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- Database: MongoDB
- AI: Google Gemini and sentence-transformers

## Requirements

- Node.js 20+
- Python 3.11+
- MongoDB instance
- Google Gemini API key

## Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd ai-ecommerce
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment variables

Create a `.env` file inside `backend/` with:

```env
MONGO_URI=mongodb://<username>:<password>@localhost:27017
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Load sample products

The backend will automatically load `backend/data/sample_products.json` into MongoDB on startup when the products collection is empty.

If you prefer to seed manually, you can also import the file into `ai_commerce.products`:

```js
use ai_commerce
const data = cat('backend/data/sample_products.json')
const products = JSON.parse(data)
db.products.insertMany(products)
```

### 5. Start backend

```bash
uvicorn main:app --reload
```

By default the API will be available at `http://127.0.0.1:8000`.

### 6. Frontend setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available at `http://localhost:3000`.

## Backend API Endpoints

- `GET /` - Health check
- `GET /products` - List all products
- `GET /products/{product_id}` - Get product details
- `POST /signup` - Create user account
- `POST /login` - Authenticate user
- `POST /chat` - AI shopping assistant chat
- `GET /ai-search?query=` - Simple product search
- `GET /semantic-search?query=` - Semantic product search
- `GET /vector-search?query=` - Vector search results
- `GET /recommend` - Product recommendations
- `POST /review-summary` - Summarize review text
- `POST /place-order` - Place an order
- `GET /orders` - List all orders

## Notes

- The backend uses a static `SECRET_KEY` in `backend/main.py`; update it for production.
- The backend defaults `MONGO_URI` to `mongodb://localhost:27017` when no env value is provided.
- The sample AI modules use simple embeddings and text matching for demo purposes.
- Gemini API calls require a valid `GEMINI_API_KEY`; if none is provided, the backend still runs in demo mode.

## Future Improvements

- Add frontend authentication and protected routes
- Persist sample data automatically on startup
- Expand product detail and cart functionality
- Improve AI prompts and search accuracy
