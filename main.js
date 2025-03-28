import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer la configuración
const configPath = path.join(__dirname, 'config.json');
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('Error reading config file:', error);
}

let mainWindow;

// Crear la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    // Cargar el archivo HTML
    mainWindow.loadFile('index.html');

    // Siempre abrir las herramientas de desarrollo
    // mainWindow.webContents.openDevTools();

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
        // Verificar que el preload script se cargó correctamente
        mainWindow.webContents.executeJavaScript(`
            console.log('Verificando electronAPI:', window.electronAPI);
        `);
    });
}

// Cuando la aplicación esté lista, crear la ventana
app.whenReady().then(() => {
    createWindow();
});

// Manejar la actualización de la configuración
ipcMain.on('config-saved', (event, newConfig) => {
    config = newConfig;
    global.appConfig = config;
    
    // Recargar la ventana principal para aplicar los cambios
    if (mainWindow) {
        mainWindow.reload();
    }
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// En macOS, recrear la ventana cuando se hace clic en el icono del dock
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Exponer la configuración a través de una variable global
global.appConfig = config; 