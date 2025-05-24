import json
import numpy as np
from numpy.linalg import norm
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
  "temperature": 0.7,
  "max_output_tokens": 512,
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
)
chat_session = model.start_chat(history=[])

def load_data():
    with open("data/chunks.json", "r", encoding="utf-8") as f:
        chunks = json.load(f)
    embeddings = np.load("data/embeddings.npy")
    return chunks, embeddings

def get_embedding(text):
    res = genai.embed_content(
        model="models/embedding-001",
        content=text,
    )
    return np.array(res["embedding"])

def cosine_similarity(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))

def find_top_k_similar(query_emb, embeddings, k=3):
    sims = [cosine_similarity(query_emb, emb) for emb in embeddings]
    top_k_idx = np.argsort(sims)[-k:][::-1]
    top_k_scores = [sims[i] for i in top_k_idx]
    return top_k_idx, top_k_scores

def generate_answer(prompt):
    response = chat_session.send_message(prompt)
    return response.text

def main():
    chunks, embeddings = load_data()
    print("Данные загружены. Введите запрос.")
    while True:
        query = input("\nВаш запрос: ").strip()
        try:
            query_emb = get_embedding(query)
            top_idx, top_scores = find_top_k_similar(query_emb, embeddings, k=5)
            print("\nТоп-5 похожих чанка:")
            for i, idx in enumerate(top_idx):
                print(f"{i+1}. (score={top_scores[i]:.4f}): {chunks[idx][:500]}...")

            context = "\n\n".join([chunks[idx] for idx in top_idx])
            prompt_for_answer = f"Используя следующие данные:\n{context}\n\nОтветь на вопрос:\n{query}"

            answer = generate_answer(prompt_for_answer)
            print("\nОтвет модели:\n" + answer)

        except Exception as e:
            print(f"Ошибка при обработке запроса: {e}")

if __name__ == "__main__":
    main()
