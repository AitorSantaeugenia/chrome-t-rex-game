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
        showError('Please enter a valid name and score');
        return;
    }

    try {
        // Guardar en la base de datos
        const saved = await Database.saveScore(name, score);

        if (saved) {
            // Actualizar la tabla de puntuaciones
            await Database.updateLeaderboard();
            
            // Limpiar el formulario
            document.getElementById("playerName").value = "";
            
            // Forzar la recarga de la página después de un breve retraso
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving score:', error);
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
    
    if (!alertBanner || !alertOverlay || !alertMessage) {
        console.error('Alert elements not found:', {
            alertBanner: !alertBanner,
            alertOverlay: !alertOverlay,
            alertMessage: !alertMessage
        });
        return;
    }
    
    // Asegurarse de que el banner sea visible
    alertBanner.style.display = 'flex';
    alertBanner.style.visibility = 'visible';
    alertBanner.style.opacity = '1';
    alertBanner.style.zIndex = '1000';
    alertBanner.classList.remove('hidden');
    alertBanner.style.position = 'fixed';
    alertBanner.style.top = '20px';
    alertBanner.style.left = '50%';
    alertBanner.style.transform = 'translateX(-50%)';
    
    // Asegurarse de que el mensaje sea visible
    alertMessage.style.display = 'block';
    alertMessage.style.visibility = 'visible';
    alertMessage.style.opacity = '1';
    alertMessage.classList.remove('hidden');
    alertMessage.textContent = message;
    
    // Asegurarse de que el overlay sea visible
    alertOverlay.style.display = 'block';
    alertOverlay.style.visibility = 'visible';
    alertOverlay.style.opacity = '1';
    alertOverlay.classList.remove('hidden');
    
    // Forzar un reflow para asegurar que los cambios se apliquen
    alertBanner.offsetHeight;
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

// Función para cerrar el alert
export function closeAlert() {
    const alertBanner = document.getElementById('alertBanner');
    const alertOverlay = document.getElementById('alertOverlay');
    const alertMessage = document.getElementById('alertMessage');
    
    if (!alertBanner || !alertOverlay || !alertMessage) {
        console.error('Alert elements not found when closing');
        return;
    }
    
    alertMessage.style.opacity = '0';
    alertMessage.classList.add('hidden');
    
    alertBanner.style.opacity = '0';
    alertBanner.classList.add('hidden');
    
    alertOverlay.style.opacity = '0';
    alertOverlay.classList.add('hidden');
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