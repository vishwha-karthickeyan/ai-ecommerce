from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

products = [
    "gaming laptop high performance",
    "gaming mouse rgb lights",
    "iphone camera battery",
    "sports running shoes"
]

vectorizer = CountVectorizer()

vectors = vectorizer.fit_transform(products)

similarity = cosine_similarity(vectors)


def get_recommendations(index=0):

    scores = list(enumerate(similarity[index]))

    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    recommended = []

    for item in scores[1:3]:
        recommended.append(products[item[0]])

    return recommended