
import pandas as pd
import sys
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# print(sys.argv[1])
movie_req = sys.argv[1]
num = sys.argv[2]
no_rec=int(num)


def get_title_from_index(index):
	return df[df.index == index]["title"].values[0]

def get_index_from_title(title):
	return df[df.title == title]["index"].values[0]

file_path = "./python/movie_dataset.csv"

df = pd.read_csv(file_path)

features = ['keywords','cast','genres','director']

for feature in features:
	df[feature] = df[feature].fillna('')

def combine_features(row):
	try:
		return row['keywords'] +" "+row['cast']+" "+row["genres"]+" "+row["director"]
	except:
		print ("Error:", row)

df["combined_features"] = df.apply(combine_features,axis=1)

def get_user_reviews(df, movie_required, no_reccomendations):
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(df["combined_features"])
    cosine_sim = cosine_similarity(count_matrix) 
    movie_user_likes = movie_required
    movie_index = get_index_from_title(movie_user_likes)
    similar_movies =  list(enumerate(cosine_sim[movie_index]))
    sorted_similar_movies = sorted(similar_movies,key=lambda x:x[1],reverse=True)
    
    reccomondation_count=0
    reccomondation_list = []
    for element in sorted_similar_movies:
        recommondation = get_title_from_index(element[0]) 
        # print(recommondation)
        reccomondation_list.append(recommondation)
        reccomondation_count += 1
        
        if (reccomondation_count>no_reccomendations):
            break
        
    return(reccomondation_list)

reccomondations = get_user_reviews(df, movie_required=movie_req , no_reccomendations=no_rec)
print(reccomondations)
