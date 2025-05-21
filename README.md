# Clustering_et_D-tection_de_Fake_News
# Système de Détection de Fake News et Clustering pour COVID-19

## Introduction

Ce projet propose une application web complète dédiée à l'analyse et à la détection de fausses informations (fake news) liées à la COVID-19. Dans un contexte où la désinformation peut avoir des conséquences graves sur la santé publique, cet outil permet d'analyser des textes et tweets pour déterminer leur fiabilité grâce à des techniques d'apprentissage automatique. Le système intègre également des fonctionnalités avancées de clustering pour regrouper et visualiser des ensembles de textes selon leur contenu sémantique, offrant ainsi une perspective plus large sur les tendances informationnelles liées à la pandémie.

L'application repose sur une architecture Flask en backend et une interface utilisateur interactive en frontend, permettant une utilisation intuitive même pour des utilisateurs non techniques. Le modèle de détection implémenté est basé sur un algorithme Random Forest préalablement entraîné sur un jeu de données spécifique aux informations COVID-19, garantissant une pertinence contextuelle des analyses effectuées.

## Fonctionnalités principales

L'application propose trois fonctionnalités majeures accessibles via une interface web intuitive et responsive :

La détection individuelle de fake news permet d'analyser un texte unique et de déterminer s'il s'agit d'une information fiable ou d'une fake news. Le système fournit non seulement une classification binaire (FAKE/REAL) mais également un score de probabilité permettant d'évaluer le degré de confiance de la prédiction. Cette fonctionnalité est particulièrement utile pour vérifier rapidement la fiabilité d'une information spécifique avant de la partager.

Le clustering de textes constitue la deuxième fonctionnalité principale et permet de regrouper un ensemble de textes en clusters thématiques. L'utilisateur peut choisir parmi quatre algorithmes différents (K-Means, DBSCAN, Clustering Agglomératif, et Gaussian Mixture Model) et définir le nombre de clusters souhaité. Les résultats sont visualisés sous forme de graphique interactif, où chaque point représente un texte positionné dans un espace bidimensionnel obtenu par réduction de dimensionnalité (PCA). Cette visualisation facilite l'identification de tendances et de groupes thématiques dans un corpus de textes.

Enfin, l'analyse par lot permet de traiter simultanément plusieurs textes et d'obtenir une vue d'ensemble sur la proportion de fake news dans un corpus. Les résultats sont présentés sous forme de tableau détaillé et de graphique circulaire, offrant une vision synthétique de la répartition entre informations fiables et fausses informations.

## Structure du projet

Le projet est organisé selon une architecture modulaire facilitant la maintenance et l'évolution du code. Les principaux composants sont :

Le fichier `app.py` constitue le cœur de l'application. Il contient toute la logique backend, incluant les routes Flask, les fonctions de prétraitement de texte, la prédiction de fake news et les algorithmes de clustering. Ce fichier implémente également les API REST utilisées par le frontend pour effectuer les différentes analyses.

Le dossier `templates` contient le fichier `index.html` qui définit la structure de l'interface utilisateur. Cette page unique utilise une approche par sections pour présenter les trois fonctionnalités principales de l'application, avec une navigation fluide entre elles.

Le dossier `static` comprend les ressources frontend : `style.css` pour la mise en forme et `script.js` pour l'interactivité côté client. Le script JavaScript gère les interactions utilisateur, les appels API vers le backend, et la visualisation des résultats à l'aide de la bibliothèque Chart.js.

Le fichier `requirements.txt` liste toutes les dépendances Python nécessaires au fonctionnement de l'application, facilitant ainsi son déploiement dans différents environnements.

Le modèle préentraîné `random_forest_model.pkl` est utilisé pour la détection de fake news. Ce modèle a été entraîné sur un jeu de données spécifique aux informations COVID-19 et est chargé au démarrage de l'application.

Le fichier `Constraint_Train.csv` contient probablement les données d'entraînement utilisées pour le modèle, bien que l'application utilise directement le modèle préentraîné pour les prédictions.

Le notebook Jupyter `Covid-19 Fake News Detection System.ipynb` documente vraisemblablement le processus d'exploration des données, de prétraitement, d'entraînement et d'évaluation du modèle de détection.

## Installation et configuration

Pour installer et exécuter l'application sur votre environnement local, suivez ces étapes :

1. Clonez ce dépôt GitHub sur votre machine locale.

2. Créez et activez un environnement virtuel Python (recommandé) :
   ```
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```

3. Installez les dépendances requises :
   ```
   pip install -r requirements.txt
   ```

4. Téléchargez les ressources NLTK nécessaires en exécutant Python dans un terminal :
   ```python
   import nltk
   nltk.download('punkt')
   nltk.download('stopwords')
   nltk.download('wordnet')
   ```

5. Modifiez le chemin du modèle dans le fichier `app.py` pour qu'il corresponde à votre structure de répertoire locale. Recherchez la ligne contenant `MODEL_PATH` et ajustez le chemin en conséquence.

6. Lancez l'application :
   ```
   python app.py
   ```

7. Accédez à l'application dans votre navigateur à l'adresse `http://localhost:5000`

## Utilisation

L'interface utilisateur de l'application est divisée en trois sections principales, chacune correspondant à une fonctionnalité spécifique :

### Détection de Fake News

Cette section permet d'analyser un texte individuel pour déterminer s'il s'agit d'une fake news ou d'une information fiable. Pour l'utiliser :

1. Entrez ou collez le texte à analyser dans le champ de texte.
2. Cliquez sur le bouton "Analyser".
3. Le résultat s'affiche avec une indication claire (FAKE NEWS ou INFORMATION FIABLE) et un pourcentage de probabilité représenté graphiquement.

### Clustering de Tweets COVID-19

Cette fonctionnalité permet de regrouper plusieurs textes en clusters thématiques :

1. Entrez plusieurs textes dans le champ prévu, en plaçant chaque texte sur une ligne distincte.
2. Sélectionnez l'algorithme de clustering souhaité parmi les options disponibles.
3. Définissez le nombre de clusters désiré (entre 2 et 10).
4. Cliquez sur "Effectuer le clustering".
5. Visualisez les résultats sous forme de graphique interactif où chaque couleur représente un cluster différent.
6. Consultez la distribution des textes par cluster dans le panneau latéral.

### Analyse par lot

Cette section permet d'analyser simultanément plusieurs textes :

1. Entrez plusieurs textes dans le champ prévu, en plaçant chaque texte sur une ligne distincte.
2. Cliquez sur "Analyser le lot".
3. Consultez les résultats sous forme de graphique circulaire montrant la répartition entre fake news et informations fiables.
4. Examinez le tableau détaillé présentant chaque texte avec sa prédiction et sa probabilité associée.

## Aspects techniques et fonctionnement

Le système repose sur plusieurs composants techniques qui méritent d'être détaillés :

### Prétraitement des textes

Avant toute analyse, les textes sont prétraités selon une séquence d'opérations visant à normaliser et nettoyer les données :
- Conversion en minuscules
- Suppression des URLs, mentions et hashtags
- Élimination des caractères non alphanumériques et des chiffres
- Tokenisation (découpage en mots)
- Suppression des mots vides (stopwords)
- Lemmatisation (réduction des mots à leur forme canonique)

Ce prétraitement est essentiel pour améliorer la qualité des analyses en réduisant le bruit et en standardisant les textes.

### Modèle de détection

Le système utilise un modèle Random Forest préentraîné pour la classification des textes. Ce modèle a été choisi pour sa robustesse et sa capacité à gérer efficacement les problèmes de classification binaire. Le modèle est chargé au démarrage de l'application depuis le fichier `random_forest_model.pkl`.

### Algorithmes de clustering

L'application propose quatre algorithmes de clustering différents, chacun ayant ses propres caractéristiques :
- K-Means : algorithme classique basé sur la distance euclidienne, particulièrement adapté aux clusters de forme sphérique.
- DBSCAN : algorithme basé sur la densité, capable de détecter des clusters de forme arbitraire et de filtrer le bruit.
- Clustering Agglomératif : approche hiérarchique ascendante, fusionnant progressivement les clusters les plus proches.
- Gaussian Mixture Model (GMM) : modèle probabiliste supposant que les données sont générées par un mélange de distributions gaussiennes.

### Visualisation

La visualisation des résultats de clustering utilise une réduction de dimensionnalité par Analyse en Composantes Principales (PCA) pour projeter les données textuelles dans un espace bidimensionnel. Cette technique permet de représenter visuellement des données de haute dimension tout en préservant au maximum la structure des données.

## Limitations et perspectives d'amélioration

Malgré ses fonctionnalités avancées, le système présente quelques limitations qui pourraient être adressées dans de futures versions :

Le modèle actuel est spécifiquement entraîné sur des données liées à la COVID-19, ce qui limite son application à d'autres domaines. Une amélioration possible serait d'intégrer des modèles plus génériques ou de permettre l'entraînement de modèles spécifiques à d'autres thématiques.

L'application utilise actuellement une approche simplifiée pour la vectorisation des nouveaux textes, ce qui pourrait affecter la précision des prédictions. L'intégration du vectoriseur original utilisé lors de l'entraînement améliorerait la cohérence entre l'entraînement et l'inférence.

Le système ne prend en charge que les textes en anglais pour le moment, comme en témoigne l'utilisation des stopwords anglais dans le prétraitement. L'ajout du support multilingue, notamment pour le français, élargirait considérablement l'utilité de l'application.

## Conclusion

Ce système de détection de fake news et de clustering pour COVID-19 offre un outil précieux pour analyser et comprendre l'information circulant sur la pandémie. Grâce à son interface intuitive et ses fonctionnalités avancées, il permet aussi bien aux chercheurs qu'aux utilisateurs non techniques d'explorer et d'évaluer la fiabilité des informations liées à la COVID-19. Les possibilités d'amélioration et d'extension sont nombreuses, faisant de ce projet une base solide pour le développement d'outils plus sophistiqués de lutte contre la désinformation.
