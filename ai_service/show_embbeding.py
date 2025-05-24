import numpy as np

data = np.load("data/embeddings.npy")

print(type(data))
print(data.shape)

print(data[:100])
