import { db, collection, addDoc, getDocs, orderBy, limit, query, where, startAfter, deleteDoc } from './firebase-config.js';
import { showError } from './index.js';

export const Database = {
    // Guardar una nueva puntuación
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
             ('Verificando límite de puntuaciones para:', name);
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
                 ('Puntuación más antigua eliminada para mantener el límite');
            }
            
            return true;
        } catch (error) {
            console.error('Error verificando límite de puntuaciones:', error);
            return false;
        }
    },

    // Guardar una nueva puntuación
    async saveScore(name, score) {
        try {
             ('Intentando guardar puntuación:', { name, score });
            
            // Validaciones básicas
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                console.error('Invalid name');
                showError('Please enter a valid name');
                return false;
            }
            
            if (!score || typeof score !== 'number' || score <= 0) {
                console.error('Invalid score');
                showError('Please enter a valid score');
                return false;
            }

            // Verificar si el nombre ya existe
            const nameExists = await this.checkNameExists(name);
            if (nameExists) {
                 ('El nombre ya existe en la base de datos');
                showError('You reached the daily limit of 2 scores. Please wait 24 hours before trying again.');
                return false;
            }

            // Verificar límite diario
            const attempts = await this.getAttemptsInLastHour(name);
            if (attempts >= 2) {
                 ('Límite diario alcanzado para:', name);
                showError('Has alcanzado el límite de 2 puntuaciones por día. Por favor, espera 24 horas antes de intentar de nuevo.');
                return false;
            }

            // Guardar la nueva puntuación
             ('Guardando puntuación en Firestore...');
            const docRef = await addDoc(collection(db, 'scores'), {
                name: name.trim(),
                score: score,
                timestamp: Date.now()
            });

             ('Score saved successfully! con ID:', docRef.id);
            return true;
        } catch (error) {
            console.error('Error detallado al guardar puntuación:', {
                message: error.message,
                code: error.code,
                details: error.details,
                stack: error.stack
            });
            
            // Manejar el error de límite diario
            if (error.code === 'permission-denied') {
                showError('Has alcanzado el límite de 2 puntuaciones por día. Por favor, espera 24 horas antes de intentar de nuevo.');
            } else {
                showError('Error saving score. Please try again.');
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
             ('Obteniendo última puntuación para:', name);
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
                 ('Última puntuación encontrada:', lastScore);
                return lastScore;
            }
             ('No se encontraron puntuaciones anteriores');
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
             ('Verificando intentos para:', name, 'desde:', new Date(oneDayAgo).toISOString());
            
            const q = query(
                collection(db, 'scores'),
                where('name', '==', name),
                where('timestamp', '>=', oneDayAgo)
            );
            
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;
             ('Número de intentos encontrados:', count);
            
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
            pageInfo.textContent = `Página ${page} de ${result.totalPages}`;
            
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