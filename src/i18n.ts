// src/i18n.ts — Configuración de react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: es },
        },
        lng: 'es',
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false, // React ya escapa por defecto
        },
    });

export default i18n;
