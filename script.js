// Script principal pour l'application de détection de fake news et clustering COVID-19

document.addEventListener('DOMContentLoaded', function() {
    // Formulaire de détection
    const detectionForm = document.getElementById('detection-form');
    const detectionResult = document.getElementById('detection-result');
    const resultAlert = document.getElementById('result-alert');
    const resultLabel = document.getElementById('result-label');
    const resultProbability = document.getElementById('result-probability');
    const resultProgress = document.getElementById('result-progress');

    // Formulaire de clustering
    const clusteringForm = document.getElementById('clustering-form');
    const clusteringResult = document.getElementById('clustering-result');
    const clusterChart = document.getElementById('cluster-chart');
    const clusterDistribution = document.getElementById('cluster-distribution');

    // Formulaire d'analyse par lot
    const batchForm = document.getElementById('batch-form');
    const batchResult = document.getElementById('batch-result');
    const batchChart = document.getElementById('batch-chart');
    const batchTableBody = document.getElementById('batch-table-body');

    // Variables pour stocker les graphiques
    let clusterChartInstance = null;
    let batchChartInstance = null;

    // Gestion du formulaire de détection
    detectionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tweetText = document.getElementById('tweet-text').value;
        
        if (!tweetText) {
            alert('Veuillez entrer un texte à analyser.');
            return;
        }
        
        // Appel à l'API de détection
        fetch('/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: tweetText })
        })
        .then(response => response.json())
        .then(data => {
            // Afficher les résultats
            detectionResult.classList.remove('d-none');
            
            const probability = Math.round(data.probability * 100);
            
            resultLabel.textContent = data.label === 'FAKE' ? 'FAKE NEWS' : 'INFORMATION FIABLE';
            resultProbability.textContent = probability;
            resultProgress.style.width = `${probability}%`;
            
            if (data.label === 'FAKE') {
                resultAlert.className = 'alert alert-danger';
                resultProgress.className = 'progress-bar progress-bar-fake bg-danger';
            } else {
                resultAlert.className = 'alert alert-success';
                resultProgress.className = 'progress-bar progress-bar-real bg-success';
            }
            
            // Scroll vers les résultats
            detectionResult.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'analyse.');
        });
    });

    // Gestion du formulaire de clustering
    clusteringForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const textsArea = document.getElementById('cluster-texts').value;
        const algorithm = document.getElementById('cluster-algorithm').value;
        const nClusters = document.getElementById('cluster-number').value;
        
        if (!textsArea) {
            alert('Veuillez entrer des textes à analyser.');
            return;
        }
        
        // Diviser les textes par ligne
        const texts = textsArea.split('\n').filter(text => text.trim() !== '');
        
        if (texts.length < 2) {
            alert('Veuillez entrer au moins deux textes pour le clustering.');
            return;
        }
        
        // Appel à l'API de clustering
        fetch('/cluster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                texts: texts,
                algorithm: algorithm,
                n_clusters: parseInt(nClusters)
            })
        })
        .then(response => response.json())
        .then(data => {
            // Afficher les résultats
            clusteringResult.classList.remove('d-none');
            
            // Préparer les données pour le graphique
            const points = data.points;
            const labels = data.labels;
            
            // Compter le nombre d'éléments par cluster
            const clusterCounts = {};
            labels.forEach(label => {
                clusterCounts[label] = (clusterCounts[label] || 0) + 1;
            });
            
            // Afficher la distribution des clusters
            clusterDistribution.innerHTML = '';
            Object.keys(clusterCounts).sort((a, b) => a - b).forEach(cluster => {
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.textContent = `Cluster ${cluster}`;
                
                const badge = document.createElement('span');
                badge.className = 'badge bg-primary rounded-pill';
                badge.textContent = clusterCounts[cluster];
                
                item.appendChild(badge);
                clusterDistribution.appendChild(item);
            });
            
            // Créer le graphique de clustering
            if (clusterChartInstance) {
                clusterChartInstance.destroy();
            }
            
            // Générer des couleurs pour chaque cluster
            const uniqueLabels = [...new Set(labels)];
            const colors = uniqueLabels.map((_, i) => 
                `hsl(${Math.floor(360 * i / uniqueLabels.length)}, 70%, 60%)`
            );
            
            // Préparer les datasets pour le graphique
            const datasets = uniqueLabels.map(cluster => {
                const clusterPoints = points.filter((_, i) => labels[i] === cluster);
                return {
                    label: `Cluster ${cluster}`,
                    data: clusterPoints.map(point => ({ x: point[0], y: point[1] })),
                    backgroundColor: colors[uniqueLabels.indexOf(cluster)],
                    borderColor: colors[uniqueLabels.indexOf(cluster)],
                    pointRadius: 5,
                    pointHoverRadius: 8
                };
            });
            
            // Créer le graphique
            clusterChartInstance = new Chart(clusterChart, {
                type: 'scatter',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Visualisation des clusters'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const index = context.dataIndex;
                                    const datasetIndex = context.datasetIndex;
                                    const clusterLabel = uniqueLabels[datasetIndex];
                                    const pointIndices = labels.map((label, i) => label === clusterLabel ? i : -1).filter(i => i !== -1);
                                    const textIndex = pointIndices[index];
                                    return data.texts[textIndex].substring(0, 50) + (data.texts[textIndex].length > 50 ? '...' : '');
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Composante principale 1'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Composante principale 2'
                            }
                        }
                    }
                }
            });
            
            // Scroll vers les résultats
            clusteringResult.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors du clustering.');
        });
    });

    // Gestion du formulaire d'analyse par lot
    batchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const textsArea = document.getElementById('batch-texts').value;
        
        if (!textsArea) {
            alert('Veuillez entrer des textes à analyser.');
            return;
        }
        
        // Diviser les textes par ligne
        const texts = textsArea.split('\n').filter(text => text.trim() !== '');
        
        if (texts.length < 1) {
            alert('Veuillez entrer au moins un texte pour l\'analyse par lot.');
            return;
        }
        
        // Appel à l'API d'analyse par lot
        fetch('/batch_detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ texts: texts })
        })
        .then(response => response.json())
        .then(data => {
            // Afficher les résultats
            batchResult.classList.remove('d-none');
            
            // Compter le nombre de fake news et d'informations réelles
            const fakeCount = data.filter(item => item.label === 'FAKE').length;
            const realCount = data.filter(item => item.label === 'REAL').length;
            
            // Créer le tableau des résultats
            batchTableBody.innerHTML = '';
            data.forEach((result, index) => {
                const row = document.createElement('tr');
                
                const indexCell = document.createElement('td');
                indexCell.textContent = index + 1;
                
                const textCell = document.createElement('td');
                textCell.textContent = texts[index].length > 50 
                    ? texts[index].substring(0, 50) + '...' 
                    : texts[index];
                textCell.title = texts[index];
                
                const predictionCell = document.createElement('td');
                predictionCell.textContent = result.label;
                predictionCell.className = result.label === 'FAKE' 
                    ? 'text-danger' 
                    : 'text-success';
                
                const probabilityCell = document.createElement('td');
                probabilityCell.textContent = `${Math.round(result.probability * 100)}%`;
                
                row.appendChild(indexCell);
                row.appendChild(textCell);
                row.appendChild(predictionCell);
                row.appendChild(probabilityCell);
                
                batchTableBody.appendChild(row);
            });
            
            // Créer le graphique de répartition
            if (batchChartInstance) {
                batchChartInstance.destroy();
            }
            
            batchChartInstance = new Chart(batchChart, {
                type: 'pie',
                data: {
                    labels: ['Fake News', 'Informations Fiables'],
                    datasets: [{
                        data: [fakeCount, realCount],
                        backgroundColor: ['#dc3545', '#28a745'],
                        borderColor: ['#b02a37', '#146c43'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Répartition des résultats'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label;
                                    const value = context.raw;
                                    const total = fakeCount + realCount;
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            // Scroll vers les résultats
            batchResult.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'analyse par lot.');
        });
    });

    // Navigation fluide
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Mettre à jour la classe active dans la navigation
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
});
