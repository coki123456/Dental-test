// src/components/AuthedApp.tsx
import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import ModalsRoot from './ModalsRoot';
import AppRoutes from '../router/AppRoutes';

import { usePatients } from '../hooks/usePatients';
import { useTurnos } from '../hooks/useTurnos';
import { ModalsProvider } from '../hooks/useModals';
import { useNormalizedPatients } from '../hooks/useNormalizedPatients';

import { AppointmentService } from '../services/AppointmentService';

import type { Session } from '@supabase/supabase-js';

interface AuthedAppProps {
    onLogout: () => void;
    justLoggedIn: boolean;
    onConsumedLogin: () => void;
    session: Session | null;
}

const titleByPath = (pathname: string): string => {
    if (pathname.startsWith('/pacientes')) return 'Pacientes';
    if (pathname.startsWith('/turnos')) return 'Turnos';
    if (pathname.startsWith('/configuracion')) return 'Configuración';
    return 'Dashboard';
};

export default function AuthedApp({ onLogout, justLoggedIn, onConsumedLogin, session }: AuthedAppProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Navigate to home after login
    useEffect(() => {
        if (justLoggedIn) {
            navigate('/', { replace: true });
            onConsumedLogin?.();
        }
    }, [justLoggedIn, navigate, onConsumedLogin]);

    // Sync pendientes con Google Calendar al iniciar y periódicamente
    const sessionRef = React.useRef(session);
    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    useEffect(() => {
        const runSync = async () => {
            try {
                await AppointmentService.syncPendingAppointments(sessionRef.current);
            } catch (e) {
                console.error('Auto-Sync failed:', e);
            }
        };
        const initialTimer = setTimeout(runSync, 2000);
        const interval = setInterval(runSync, 300_000); // 5 min
        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const { patients, loading, error, addPatient, updatePatient, refreshPatients } = usePatients(session);
    const { turnos, refreshTurnos } = useTurnos(null, null, session);
    const { normalizedPatients } = useNormalizedPatients(patients);

    const headerTitle = titleByPath(location.pathname);

    return (
        <ModalsProvider
            session={session}
            patients={normalizedPatients}
            turnos={turnos}
            addPatient={addPatient}
            updatePatient={updatePatient}
            refreshTurnos={refreshTurnos}
            refreshPatients={refreshPatients}
        >
            <div className="flex h-screen bg-gray-100">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout} />

                <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                    <Header title={headerTitle} setSidebarOpen={setSidebarOpen} onLogout={onLogout} session={session} />

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
                            <div className="flex justify-between items-center">
                                <span>Error cargando pacientes: {error}</span>
                                <button onClick={refreshPatients} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    )}

                    <main className="flex-1 overflow-auto">
                        <AppRoutes
                            normalizedPatients={normalizedPatients}
                            loading={loading}
                            refreshPatients={refreshPatients}
                            session={session}
                        />
                    </main>
                </div>

                {/* ModalsRoot requires no external props — all comes from context */}
                <ModalsRoot />
            </div>
        </ModalsProvider>
    );
}
