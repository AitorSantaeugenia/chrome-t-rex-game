const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
    // Configuración
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    
    // Base de datos
    saveScore: (score, playerName) => ipcRenderer.invoke('save-score', score, playerName),
    getLeaderboard: () => ipcRenderer.invoke('get-leaderboard'),
    getDailyAttempts: () => ipcRenderer.invoke('get-daily-attempts'),
    
    // Alertas
    showError: (message) => ipcRenderer.invoke('show-error', message),
    closeAlert: () => ipcRenderer.invoke('close-alert'),
    
    // Navegación
    prevPage: () => ipcRenderer.invoke('prev-page'),
    nextPage: () => ipcRenderer.invoke('next-page'),
    
    // Configuración de Firebase
    getFirebaseConfig: () => ipcRenderer.invoke('get-firebase-config'),
    
    // Reinicio de juego
    restartGame: () => ipcRenderer.invoke('restart-game')
}); 