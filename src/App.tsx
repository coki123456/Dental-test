// src/App.tsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './config/supabaseClient';
import LoginView from './components/LoginView';
import AuthedApp from './components/AuthedApp';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

export default function App() {
    const [session, setSession] = React.useState<Session | null>(null);
    const [loading, setLoading] = React.useState(true);
    const lastSessionId = React.useRef<string | null>(null);

    React.useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            const newId = newSession?.user?.id ?? null;

            // Evitar actualizaciones de estado si el ID de usuario no ha cambiado
            if (newId === lastSessionId.current && event !== 'SIGNED_OUT') {
                setLoading(false);
                return;
            }

            lastSessionId.current = newId;

            if (event === 'SIGNED_OUT' || !newSession) {
                setSession(null);
                setLoading(false);
                return;
            }

            setSession(newSession);
            setLoading(false);

            // Sincronización del token de Google (solo en eventos clave)
            if (
                newSession.provider_refresh_token &&
                newSession.user &&
                (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
            ) {
                supabase
                    .from('profiles')
                    .upsert({ id: newSession.user.id, google_refresh_token: newSession.provider_refresh_token })
                    .then(({ error }) => {
                        if (error) console.error('App: Error syncing refresh token:', error);
                    });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        console.log('Manual logout triggered');
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Supabase signOut error:', error);
                // Solo lanzamos el error; el bloque finally limpia el estado local de igual modo
                // pero lo registramos para debugging
            }
        } catch (err) {
            console.error('Logout caught unexpected error:', err);
        } finally {
            // Limpiar storage siempre después del intento de signOut
            localStorage.clear();
            sessionStorage.clear();
            setSession(null);
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-teal-600 font-medium font-sans">
                Cargando sesión...
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Legal Routes */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Auth-protected Routes */}
                <Route
                    path="/*"
                    element={
                        !session ? (
                            <LoginView onSuccess={() => { }} />
                        ) : (
                            <AuthedApp onLogout={handleLogout} justLoggedIn={false} onConsumedLogin={() => { }} session={session} />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}
