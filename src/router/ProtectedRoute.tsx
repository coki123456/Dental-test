// src/router/ProtectedRoute.tsx
// Etapa 3 – Rutas protegidas: redirige a / si no hay sesión activa.
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
    session: Session | null;
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Wraps a route and redirects unauthenticated users.
 * Preserves the attempted URL so the user can be returned after login.
 */
export function ProtectedRoute({
    session,
    children,
    redirectTo = '/',
}: ProtectedRouteProps) {
    const location = useLocation();

    if (!session) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
}
