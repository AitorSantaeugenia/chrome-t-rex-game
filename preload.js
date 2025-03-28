const { contextBridge, ipcRenderer } = require('electron');

 ('Preload script iniciado');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
    // Enviar notificación de nueva puntuación
    sendScoreNotification: (score) => {
         ('Enviando notificación de puntuación desde preload:', score);
        return ipcRenderer.invoke('send-score-notification', score)
            .then(result => {
                 ('Resultado del envío de email desde preload:', result);
                return result;
            })
            .catch(error => {
                console.error('Error al enviar email desde preload:', error);
                return false;
            });
    },

    // Enviar alerta de puntuación sospechosa
    sendSuspiciousScoreAlert: (score) => {
         ('Enviando alerta de puntuación sospechosa desde preload:', score);
        return ipcRenderer.invoke('send-suspicious-score-alert', score)
            .then(result => {
                 ('Resultado del envío de alerta desde preload:', result);
                return result;
            })
            .catch(error => {
                console.error('Error al enviar alerta desde preload:', error);
                return false;
            });
    },

    // Enviar alerta de múltiples intentos
    sendMultipleAttemptsAlert: (data) => {
         ('Enviando alerta de múltiples intentos desde preload:', data);
        return ipcRenderer.invoke('send-multiple-attempts-alert', data)
            .then(result => {
                 ('Resultado del envío de alerta desde preload:', result);
                return result;
            })
            .catch(error => {
                console.error('Error al enviar alerta desde preload:', error);
                return false;
            });
    }
});

 ('Preload script finalizado'); 