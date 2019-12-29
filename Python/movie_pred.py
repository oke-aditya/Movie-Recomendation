
from keras.models import Sequential
from keras.layers import Dense
from keras.models import model_from_json
import os
from keras.preprocessing.text import Tokenizer
import numpy as np
# from tqdm import tqdm
from keras.preprocessing.sequence import pad_sequences
# from keras.models import Sequential
# from keras.layers import Embedding, Flatten, Dense
# import matplotlib.pyplot as plt

json_file = open('./python/model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
loaded_model = model_from_json(loaded_model_json)
# load weights into new model
loaded_model.load_weights("./python/model.h5")
#print("Loaded model from disk")

labels = []
texts = []
test_texts = []
test_labels = []

filepath = './python/9_4.txt'
f = open(filepath)
try:
    test_texts.append(f.read())
    f.close()
except UnicodeDecodeError:
    f.close()

maxlen = 100        # Maximum length of review
# training_samples = 200
# validation_samples = 10000
max_words = 10000   # Use only top 10000 words

tokenizer = Tokenizer(num_words = max_words) # Returns a list of lists
tokenizer.fit_on_texts(test_texts)    # Return One hot vectors
sequences = tokenizer.texts_to_sequences(test_texts)  
x_tests = pad_sequences(sequences, maxlen = maxlen)
# word_index = tokenizer.word_index

# print('Found %s unique tokens.' % len(word_index))
# data = pad_sequences(sequences, maxlen=maxlen)
# labels = np.asarray(labels)

movie_prediction = loaded_model.predict(x_tests)

if(movie_prediction <= 0.5):
    print("Negative")
else:
    print("Positive")