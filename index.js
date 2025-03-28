import { Game } from './game.js';
import { Database } from './database.js';

const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

// Cargar la tabla de clasificación al inicio
Database.updateLeaderboard();

startButton.addEventListener("click", function () {
  document.getElementById("myCanvas").dispatchEvent(
    new MouseEvent("click", {
      clientX: 200,
      clientY: 150,
      bubbles: true,
    })
  );

  let startButtonDiv = document.getElementById("startButton");
  let canvasDiv = document.getElementById("myCanvas");
  let startbuttonDiv = document.getElementById("startbuttonDiv");

  startButtonDiv.classList.add("hidden");
  canvasDiv.classList.remove("backgroundImage");
  startbuttonDiv.classList.add("hidden");

  Game.init();
});

// Manejar el envío del formulario
document.getElementById("scoreForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("playerName").value.trim();
    const score = parseInt(Game.score);
    
    if (!name || isNaN(score)) {
        showError('Por favor, ingresa un nombre y una puntuación válida');
        return;
    }

    try {
        // Guardar en la base de datos
        const saved = await Database.saveScore(name, score);

        if (!saved) {
            showError('Error saving score. Please try again.');
            return;
        }

        // Actualizar la tabla de puntuaciones
        await Database.updateLeaderboard();
        
        // Limpiar el formulario
        document.getElementById("playerName").value = "";
        
        // Mostrar mensaje de éxito
        showError('¡Score saved successfully!');
        
        // Forzar la recarga de la página después de un breve retraso
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error al guardar la puntuación:', error);
        showError('Error saving score. Please try again.');
    }
});

// Manejar el cierre del modal de error
document.getElementById("closeErrorModal").addEventListener("click", () => {
    document.getElementById("errorModal").classList.add("hidden");
});

// Manejar el botón de reinicio
document.getElementById("restartButton").addEventListener("click", () => {
    // Reiniciar el juego
    window.location.reload();
});

// Manejar la paginación
document.getElementById("prevPage").addEventListener("click", () => {
    Database.prevPage();
});

document.getElementById("nextPage").addEventListener("click", () => {
    Database.nextPage();
});

// Manejar el cierre del alert
document.getElementById("closeAlertButton").addEventListener("click", closeAlert);

// Manejar el cierre del banner de límite diario
document.getElementById("closeBannerButton").addEventListener("click", () => {
    document.getElementById("banner-content-2").classList.add("hidden");
});

// Manejar el hover del botón de reinicio
const restartContainer = document.getElementById("restartButtonContainer");

restartContainer.addEventListener("mouseenter", () => {
    document.getElementById("restartButton").src = "./img/restart.png";
});

restartContainer.addEventListener("mouseleave", () => {
    document.getElementById("restartButton").src = "./img/restartHover.png";
});

// Función para mostrar errores
export function showError(message) {
    const alertBanner = document.getElementById('alertBanner');
    const alertOverlay = document.getElementById('alertOverlay');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    alertOverlay.classList.remove('hidden');
    alertBanner.classList.add('foceDisplay');
    alertBanner.style.display = 'flex !important';
    alertBanner.classList.remove('hidden');
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

// Función para cerrar el alert
export function closeAlert() {
    const alertBanner = document.getElementById('alertBanner');
    const alertOverlay = document.getElementById('alertOverlay');
    alertBanner.classList.add('hidden');
    alertOverlay.classList.add('hidden');
    alertBanner.classList.remove('foceDisplay');
}

// Función para mostrar/ocultar información adicional
export function toggleInfo() {
    const infoContent = document.querySelector('.banner-content-2');
    infoContent.classList.toggle('hidden');
}

// Hacer las funciones disponibles globalmente
window.showError = showError;
window.closeAlert = closeAlert;
window.toggleInfo = toggleInfo;
