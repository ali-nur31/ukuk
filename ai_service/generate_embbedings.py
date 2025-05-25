import json
import numpy as np
from docx import Document
import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyAXU3Szq3YZtUHxYHNep9L6GlAYnF7mDsE")

def load_and_chunk_docx(path, max_words=150):
    doc = Document(path)
    full_text = "\n".join(p.text.strip() for p in doc.paragraphs if p.text.strip())
    words = full_text.split()
    return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]

def get_embeddings(texts):
    embeddings = []
    for i, text in enumerate(texts):
        try:
            res = genai.embed_content(
                model="models/embedding-001",
                content=text
            )
            embeddings.append(res['embedding'])
            print(f"{i + 1}/{len(texts)}")
        except Exception as e:
            print(f"Ошибка {i + 1}: {e}")
            embeddings.append([0.0] * 768)  
    return np.array(embeddings)



if __name__ == "__main__":
    print("Загрузка документа...")
    chunks = load_and_chunk_docx("uk_kr.docx")
    print(f"Готово Чанков: {len(chunks)}")

    print("Создание эмбеддингов...")
    embeddings = get_embeddings(chunks)

    os.makedirs("data", exist_ok=True)
    with open("data/chunks.json", "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    np.save("data/embeddings.npy", embeddings)
    print("Сохранено в data/")
