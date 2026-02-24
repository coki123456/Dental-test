import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Registro del Service Worker para soporte offline (PWA)
registerSW({
    onNeedRefresh() {
        console.log('Nueva versión disponible. Recarga para actualizar.');
    },
    onOfflineReady() {
        console.log('La aplicación está lista para funcionar offline.');
    },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
