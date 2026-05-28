from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

products = [
    "iphone with good camera",
    "gaming laptop high performance",
    "wireless gaming mouse",
    "sports running shoes"
]

product_embeddings = model.encode(products)


def search_products(query):

    query_embedding = model.encode([query])

    similarity = cosine_similarity(
        query_embedding,
        product_embeddings
    )

    best_match = similarity.argmax()

    return products[best_match]