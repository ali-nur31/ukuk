from flask import Flask, request, jsonify
import numpy as np
import json
import os
import google.generativeai as genai
from numpy.linalg import norm

app = Flask(__name__)

genai.configure(api_key="AIzaSyBJVReTlkssEIlnajOyx_1BA486lTJTgYU")

generation_config = {
    "temperature": 0.7,
    "max_output_tokens": 512,
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
)
chat_session = model.start_chat(history=[])

with open("data/chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)
embeddings = np.load("data/embeddings.npy")

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
    return top_k_idx

def generate_answer(prompt):
    response = chat_session.send_message(prompt)
    return response.text

# Flask endpoint
@app.route("/query", methods=["POST"])
def handle_query():
    user_question = request.json.get("question")
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    try:
        # 1. Получаем эмбеддинг вопроса
        query_emb = get_embedding(user_question)

        # 2. Находим top-5 похожих чанка
        top_indices = find_top_k_similar(query_emb, embeddings, k=5)
        selected_chunks = [chunks[i] for i in top_indices]

        # 3. Формируем промпт
        context = "\n\n".join(selected_chunks)
        full_prompt = (
            f"Сиз Кыргыз Республикасынын Кылмыш-жаза кодексинин экспертисиз. Төмөнкү маалыматтарды колдонунуз:\n"
            f"{context}\n\n"
            f"Суроого кыргызча жооп бер:\n{user_question}"
        )

        # 4. Отправляем промпт модели
        answer = generate_answer(full_prompt)

        # 5. Возвращаем результат
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
