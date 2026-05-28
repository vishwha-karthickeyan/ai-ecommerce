import chromadb
from sentence_transformers import SentenceTransformer

client = chromadb.Client()

collection = client.get_or_create_collection(
    name="products"
)

model = SentenceTransformer('all-MiniLM-L6-v2')

products = [
    "iphone good battery",
    "gaming laptop",
    "wireless headphones",
    "sports shoes"
]

for i, product in enumerate(products):

    embedding = model.encode(product).tolist()

    collection.add(
        ids=[str(i)],
        documents=[product],
        embeddings=[embedding]
    )


def vector_search(query):

    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=2
    )

    return results