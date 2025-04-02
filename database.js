import { db, collection, addDoc, getDocs, orderBy, limit, query, where, startAfter, deleteDoc, runTransaction, doc } from './firebase-config.js';

export const Database = {
    // Función auxiliar para mostrar mensajes
    showMessage(message) {
        const alertElement = document.getElementById('alertMessage');
        const alertBanner = document.getElementById('alertBanner');
        const alertOverlay = document.getElementById('alertOverlay');
        if (alertElement) {
            alertElement.classList.remove('hidden');
            alertBanner.classList.remove('hidden');
            alertOverlay.classList.remove('hidden');
            alertElement.textContent = message;
            alertElement.style.display = 'block !important';
            alertElement.style.visibility = 'visible !important';
            alertElement.style.opacity = '1';
            alertOverlay.style.display = 'block !important';
            alertOverlay.style.visibility = 'visible !important';
            alertOverlay.style.opacity = '1';
            alertBanner.style.display = 'block !important';
            alertBanner.style.visibility = 'visible !important';
            alertBanner.style.opacity = '1';
            console.log('Message displayed:', message);
        } else {
            console.error('alertMessage element not found in the DOM');
        }
    },

    // Verificar si el nombre ya existe
    async checkNameExists(name) {
        try {
            const scoresRef = collection(db, "scores");
            const q = query(scoresRef, where("name", "==", name));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking name:", error);
            return false;
        }
    },

    // Verificar límite de puntuaciones por usuario
    async checkUserScoreLimit(name) {
        try {
            console.log('Checking score limit for:', name);
            const scoresRef = collection(db, 'scores');
            const q = query(
                scoresRef,
                where('name', '==', name),
                orderBy('timestamp', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const userScores = querySnapshot.docs.map(doc => doc.data());
            
            // Si el usuario tiene más de 10 puntuaciones, eliminar la más antigua
            if (userScores.length >= 10) {
                const oldestScore = userScores[userScores.length - 1];
                const oldestScoreDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                await deleteDoc(oldestScoreDoc.ref);
                console.log('Oldest score deleted to maintain limit');
            }
            
            return true;
        } catch (error) {
            console.error('Error checking score limit:', error);
            return false;
        }
    },

    // Guardar una nueva puntuación
    async saveScore(name, score) {
        try {
            console.log('Attempting to save score:', { name, score });
            
            // Validaciones básicas
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                console.error('Invalid name');
                this.showMessage('Please enter a valid name');
                return false;
            }
            
            if (!score || typeof score !== 'number' || score <= 0) {
                console.error('Invalid score');
                this.showMessage('Please enter a valid score');
                return false;
            }

            // Verificar si el nombre ya existe
            const nameExists = await this.checkNameExists(name);
            if (nameExists) {
                console.log('Name already exists in database');
                this.showMessage('This name is already registered. Please use a different name.');
                return false;
            }

            // Verificar límite diario global
            const attempts = await this.getAttemptsInLastHour(name);
            console.log('Current attempts count:', attempts);
            if (attempts >= 2) {
                console.log('Daily global limit reached');
                this.showMessage('You have reached the global limit of 2 scores per day. Please wait 24 hours before trying again.');
                return false;
            }

            // Guardar la nueva puntuación
            console.log('Data to send to Firestore:', {
                name: name.trim(),
                score: score,
                timestamp: Date.now()
            });
            
            // Primero registrar el intento
            await addDoc(collection(db, 'attempts'), {
                name: name.trim(),
                timestamp: Date.now()
            });
            
            // Luego guardar la puntuación
            const docRef = await addDoc(collection(db, 'scores'), {
                name: name.trim(),
                score: score,
                timestamp: Date.now()
            });

            console.log('Score saved successfully! with ID:', docRef.id);
            this.showMessage('Score saved successfully!');
            return true;
        } catch (error) {
            console.error('Detailed error saving score:', {
                message: error.message,
                code: error.code,
                details: error.details,
                stack: error.stack
            });
            
            // Manejar el error de límite diario
            if (error.code === 'permission-denied') {
                this.showMessage('You have reached the global limit of 2 scores per day. Please wait 24 hours before trying again.');
            } else {
                this.showMessage('Error saving score. Please try again.');
            }
            
            return false;
        }
    },

    isValidScore(score) {
        // Validar que la puntuación sea un número positivo
        if (typeof score !== 'number' || score < 0) return false;
        
        // Validar que la puntuación no sea extremadamente alta (por ejemplo, más de 10000)
        if (score > 10000) return false;
        
        return true;
    },

    // Obtener la última puntuación del jugador
    async getLastScore(name) {
        try {
            console.log('Getting last score for:', name);
            const scoresRef = collection(db, 'scores');
            const q = query(
                scoresRef,
                where('name', '==', name)
            );
            
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Ordenar los resultados en memoria
                const scores = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }));
                scores.sort((a, b) => b.timestamp - a.timestamp);
                const lastScore = scores[0];
                console.log('Last score found:', lastScore);
                return lastScore;
            }
            console.log('No previous scores found');
            return null;
        } catch (error) {
            console.error('Error getting last score:', error);
            return null;
        }
    },

    // Obtener intentos en las últimas 24 horas
    async getAttemptsInLastHour(name) {
        try {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 horas en milisegundos
            console.log('Checking total attempts since:', new Date(oneDayAgo).toISOString());
            
            const attemptsRef = collection(db, 'attempts');
            const q = query(
                attemptsRef,
                where('timestamp', '>=', oneDayAgo)
            );
            
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;
            console.log('Total number of attempts in the last 24 hours:', count);
            
            return count;
        } catch (error) {
            console.error('Error checking attempts:', error);
            return 0;
        }
    },

    // Obtener las mejores puntuaciones
    async getTopScores(limitCount = 5, lastDoc = null) {
        try {
            const scoresRef = collection(db, "scores");
            let q = query(scoresRef, orderBy("score", "desc"), limit(limitCount));
            
            if (lastDoc) {
                q = query(scoresRef, orderBy("score", "desc"), startAfter(lastDoc), limit(limitCount));
            }
            
            const querySnapshot = await getDocs(q);
            
            const scores = [];
            querySnapshot.forEach((doc) => {
                scores.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Obtener el total de puntuaciones
            const totalQuery = query(scoresRef, orderBy("score", "desc"));
            const totalSnapshot = await getDocs(totalQuery);
            const totalScores = totalSnapshot.size;
            
            // Calcular el número total de páginas
            const totalPages = Math.ceil(totalScores / limitCount);
            
            // Calcular si hay más páginas
            const currentPage = lastDoc ? Math.floor(totalScores / limitCount) : 1;
            const hasMore = currentPage < totalPages;
            
            return {
                scores,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore,
                totalScores,
                totalPages,
                currentPage
            };
        } catch (error) {
            console.error("Error getting scores: ", error);
            return {
                scores: [],
                lastVisible: null,
                hasMore: false,
                totalScores: 0,
                totalPages: 0,
                currentPage: 1
            };
        }
    },

    // Estado de carga y debounce
    isNavigating: false,
    navigationTimeout: null,

    // Actualizar la tabla de clasificación
    async updateLeaderboard(page = 1) {
        try {
            // Si ya está navegando, ignorar la llamada
            if (this.isNavigating) return;
            
            this.isNavigating = true;
            
            const leaderboardBody = document.getElementById("leaderboardBody");
            const prevButton = document.getElementById("prevPage");
            const nextButton = document.getElementById("nextPage");
            const pageInfo = document.getElementById("pageInfo");
            
            // Deshabilitar los botones durante la carga
            prevButton.disabled = true;
            nextButton.disabled = true;
            
            // Obtener las puntuaciones para la página actual
            const lastDoc = page > 1 ? this.lastVisible : null;
            const result = await this.getTopScores(5, lastDoc);
            
            // Guardar el último documento visible para la siguiente página
            this.lastVisible = result.lastVisible;
            
            // Limpiar la tabla
            leaderboardBody.innerHTML = "";
            
            // Calcular el rango de posiciones para esta página
            const startRank = (page - 1) * 5 + 1;
            
            // Añadir las puntuaciones a la tabla
            result.scores.forEach((score, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${startRank + index}</td>
                    <td>${score.name}</td>
                    <td>${score.score}</td>
                    <td>${new Date(score.timestamp).toLocaleDateString()}</td>
                `;
                leaderboardBody.appendChild(row);
            });
            
            // Actualizar la información de la página
            pageInfo.textContent = `Page ${page} of ${result.totalPages}`;
            
            // Actualizar el estado de los botones
            prevButton.disabled = page === 1;
            nextButton.disabled = page >= result.totalPages;
            
            // Guardar la página actual
            this.currentPage = page;
            
            // Esperar un momento antes de permitir otra navegación
            setTimeout(() => {
                this.isNavigating = false;
            }, 500); // 500ms de debounce
            
        } catch (error) {
            console.error("Error updating leaderboard:", error);
            this.showMessage('Error loading leaderboard. Please try again.');
            this.isNavigating = false;
        }
    },

    // Navegar a la página anterior
    async prevPage() {
        if (this.currentPage > 1 && !this.isNavigating) {
            await this.updateLeaderboard(this.currentPage - 1);
        }
    },

    // Navegar a la página siguiente
    async nextPage() {
        if (!this.isNavigating) {
            const result = await this.getTopScores(5, this.lastVisible);
            if (this.currentPage < result.totalPages) {
                await this.updateLeaderboard(this.currentPage + 1);
            }
        }
    }
}; 