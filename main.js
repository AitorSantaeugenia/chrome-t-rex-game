import * as dotenv from 'dotenv';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { EmailService } from './server/email-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

 ('Iniciando aplicación...');

// Inicializar el servicio de email
const emailService = new EmailService();
 ('Servicio de email inicializado');

// Leer la configuración
const configPath = path.join(__dirname, 'config.json');
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
     ('Configuración cargada:', config);
} catch (error) {
    console.error('Error reading config file:', error);
}

let mainWindow;

// Crear la ventana principal
function createWindow() {
     ('Creando ventana principal...');
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Cargar el archivo HTML
    mainWindow.loadFile('index.html');
     ('Archivo HTML cargado');

    // Siempre abrir las herramientas de desarrollo
    mainWindow.webContents.openDevTools();
     ('DevTools abiertas');

    // Manejar errores de carga
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Error al cargar la ventana:', errorCode, errorDescription);
    });

    // Manejar errores de preload
    mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
        console.error('Error al cargar el preload script:', preloadPath, error);
    });

    // Manejar cuando la ventana está lista
    mainWindow.webContents.on('dom-ready', () => {
         ('DOM listo');
        // Verificar que el preload script se cargó correctamente
        mainWindow.webContents.executeJavaScript(`
             ('Verificando electronAPI:', window.electronAPI);
        `);
    });
}

// Manejar eventos de notificación
ipcMain.handle('send-score-notification', async (event, score) => {
     ('Recibida solicitud de notificación de puntuación:', score);
    try {
        const result = await emailService.sendScoreNotification(score);
         ('Resultado del envío de email:', result);
        return result;
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        return false;
    }
});

ipcMain.handle('send-suspicious-score-alert', async (event, score) => {
     ('Recibida solicitud de alerta de puntuación sospechosa:', score);
    try {
        const result = await emailService.sendSuspiciousScoreAlert(score);
         ('Resultado del envío de alerta:', result);
        return result;
    } catch (error) {
        console.error('Error al enviar alerta:', error);
        return false;
    }
});

ipcMain.handle('send-multiple-attempts-alert', async (event, data) => {
     ('Recibida solicitud de alerta de múltiples intentos:', data);
    try {
        const result = await emailService.sendMultipleAttemptsAlert(data.name, data.attempts);
         ('Resultado del envío de alerta:', result);
        return result;
    } catch (error) {
        console.error('Error al enviar alerta:', error);
        return false;
    }
});

// Cuando la aplicación esté lista, crear la ventana
app.whenReady().then(() => {
     ('Aplicación lista, creando ventana...');
    createWindow();
});

// Manejar la actualización de la configuración
ipcMain.on('config-saved', (event, newConfig) => {
     ('Configuración actualizada:', newConfig);
    config = newConfig;
    global.appConfig = config;
    
    // Recargar la ventana principal para aplicar los cambios
    if (mainWindow) {
        mainWindow.reload();
    }
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
     ('Todas las ventanas cerradas, saliendo...');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// En macOS, recrear la ventana cuando se hace clic en el icono del dock
app.on('activate', () => {
     ('Activando aplicación...');
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Exponer la configuración a través de una variable global
global.appConfig = config;

 ('Inicialización completada'); 