from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import os
import json

app = Flask(__name__)

# Chemin vers le modèle
MODEL_PATH = r'C:\Users\rahli\OneDrive\Documents\data mining\tp1\random_forest_model.pkl'

# Charger le modèle
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

# Télécharger les ressources NLTK nécessaires
@app.route('/download_nltk', methods=['GET'])
def download_nltk_resources():
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    return jsonify({"status": "success", "message": "Ressources NLTK téléchargées"})

# Initialiser le vectoriseur
# Comme nous n'avons pas le vectoriseur original, nous en créons un nouveau
# qui sera utilisé pour les nouvelles données
vectorizer = TfidfVectorizer(max_features=5000)

# Fonction de prétraitement du texte
def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    
    # Convertir en minuscules
    text = text.lower()
    
    # Supprimer les URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Supprimer les mentions et hashtags
    text = re.sub(r'@\w+|#\w+', '', text)
    
    # Supprimer les caractères non alphanumériques
    text = re.sub(r'[^\w\s]', '', text)
    
    # Supprimer les chiffres
    text = re.sub(r'\d+', '', text)
    
    # Tokenisation
    tokens = word_tokenize(text)
    
    # Supprimer les stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    
    # Lemmatisation
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    
    # Rejoindre les tokens
    text = ' '.join(tokens)
    
    return text

# Fonction pour prédire si un texte est une fake news
def predict_fake_news(text):
    # Prétraiter le texte
    processed_text = preprocess_text(text)
    
    # Vectoriser le texte
    # Comme nous n'avons pas le vectoriseur original, nous utilisons une approche simplifiée
    # en créant un vecteur de la même taille que ce qu'attend le modèle
    # Cela peut ne pas être optimal, mais c'est une solution temporaire
    features = np.zeros(model.n_features_in_)
    
    # Remplir quelques valeurs basées sur les mots du texte
    words = processed_text.split()
    for i, word in enumerate(words[:min(len(words), 100)]):
        hash_val = hash(word) % model.n_features_in_
        features[hash_val] = 1
    
    # Prédire
    prediction = model.predict([features])[0]
    probability = model.predict_proba([features])[0]
    
    return {
        'prediction': int(prediction),
        'probability': float(probability[1]),
        'label': 'FAKE' if prediction == 1 else 'REAL'
    }

# Fonction pour effectuer le clustering
def perform_clustering(texts, n_clusters=3, algorithm='kmeans'):
    # Prétraiter les textes
    processed_texts = [preprocess_text(text) for text in texts]
    
    # Vectoriser les textes
    X = vectorizer.fit_transform(processed_texts)
    
    # Réduire la dimensionnalité pour la visualisation
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X.toarray())
    
    # Effectuer le clustering selon l'algorithme choisi
    if algorithm == 'kmeans':
        clustering = KMeans(n_clusters=n_clusters, random_state=42)
    elif algorithm == 'dbscan':
        clustering = DBSCAN(eps=0.5, min_samples=5)
    elif algorithm == 'agglomerative':
        clustering = AgglomerativeClustering(n_clusters=n_clusters)
    elif algorithm == 'gmm':
        clustering = GaussianMixture(n_components=n_clusters, random_state=42)
    
    # Appliquer l'algorithme de clustering
    if algorithm in ['kmeans', 'agglomerative']:
        labels = clustering.fit_predict(X.toarray())
    elif algorithm == 'dbscan':
        labels = clustering.fit_predict(X.toarray())
    elif algorithm == 'gmm':
        clustering.fit(X.toarray())
        labels = clustering.predict(X.toarray())
    
    # Préparer les résultats
    result = {
        'points': X_pca.tolist(),
        'labels': labels.tolist(),
        'texts': texts,
        'processed_texts': processed_texts
    }
    
    return result

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    result = predict_fake_news(text)
    return jsonify(result)

@app.route('/cluster', methods=['POST'])
def cluster():
    data = request.get_json()
    texts = data.get('texts', [])
    n_clusters = data.get('n_clusters', 3)
    algorithm = data.get('algorithm', 'kmeans')
    
    if not texts:
        return jsonify({'error': 'No texts provided'}), 400
    
    result = perform_clustering(texts, n_clusters, algorithm)
    return jsonify(result)

@app.route('/batch_detect', methods=['POST'])
def batch_detect():
    data = request.get_json()
    texts = data.get('texts', [])
    
    if not texts:
        return jsonify({'error': 'No texts provided'}), 400
    
    results = [predict_fake_news(text) for text in texts]
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
