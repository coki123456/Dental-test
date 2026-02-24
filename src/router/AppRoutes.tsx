// src/router/AppRoutes.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

import DashboardView from '../components/DashboardView';
import PacientesView from '../components/PacientesView';
import TurnosView from '../components/TurnosView';
import SettingsView from '../components/SettingsView';
import OdontogramView from '../components/OdontogramView';

import { useModals } from '../hooks/useModals';
import { ProtectedRoute } from './ProtectedRoute';

interface AppRoutesProps {
    normalizedPatients?: any[];
    loading?: boolean;
    refreshPatients?: () => void | Promise<void>;
    session: Session | null;
}

export default function AppRoutes({ normalizedPatients = [], loading = false, refreshPatients, session }: AppRoutesProps) {
    const { openAddPatient, onViewPatient, onOpenRecord, openBookingModal, onViewTurno, onDeletePatient } = useModals();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
    const [dashboardStatusFilter, setDashboardStatusFilter] = useState('Todos');
    const [locallyDeleted, setLocallyDeleted] = useState<string[]>([]);

    const patientsForViews = useMemo(() => (
        (Array.isArray(normalizedPatients) ? normalizedPatients : []).filter(p => {
            const key = p?.id || p?._id || p?.dni;
            return key && !locallyDeleted.includes(key);
        })
    ), [normalizedPatients, locallyDeleted]);

    const latestPatients = useMemo(() => patientsForViews.filter(p => p?.estado !== 'Inactivo').slice(0, 4), [patientsForViews]);

    // Wraps context onDeletePatient with optimistic local deletion
    const handleDeletePatient = useCallback(async (patientData: any) => {
        const id = typeof patientData === 'string' ? patientData : (patientData?.id || patientData?._id);
        if (!id) throw new Error('No se pudo identificar el paciente (falta ID)');
        try {
            setLocallyDeleted(prev => [...prev, id]);
            await onDeletePatient(patientData);
            await refreshPatients?.();
            setLocallyDeleted(prev => prev.filter(k => k !== id));
        } catch (err) {
            setLocallyDeleted(prev => prev.filter(k => k !== id));
            throw err;
        }
    }, [onDeletePatient, refreshPatients]);

    return (
        <Routes>
            {/* All internal routes are wrapped in ProtectedRoute */}
            <Route path="/" element={
                <ProtectedRoute session={session}>
                    <DashboardView
                        dashboardSearchTerm={dashboardSearchTerm}
                        setDashboardSearchTerm={setDashboardSearchTerm}
                        statusFilter={dashboardStatusFilter}
                        setStatusFilter={setDashboardStatusFilter}
                        onAddPatient={openAddPatient}
                        onViewPatient={onViewPatient}
                        onOpenRecord={onOpenRecord}
                        onOpenBooking={openBookingModal}
                        onViewTurno={onViewTurno}
                        patients={patientsForViews}
                        latestPatients={latestPatients}
                        loading={loading}
                    />
                </ProtectedRoute>
            } />
            <Route path="/turnos" element={
                <ProtectedRoute session={session}>
                    <TurnosView onOpenBooking={openBookingModal} onViewTurno={onViewTurno} />
                </ProtectedRoute>
            } />
            <Route path="/pacientes" element={
                <ProtectedRoute session={session}>
                    <PacientesView
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        onAddPatient={openAddPatient}
                        onViewPatient={onViewPatient}
                        onOpenRecord={onOpenRecord}
                        patients={patientsForViews}
                        loading={loading}
                        onDeletePatient={handleDeletePatient}
                    />
                </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
                <ProtectedRoute session={session}>
                    <SettingsView session={session} />
                </ProtectedRoute>
            } />
            <Route path="/pacientes/:id/odontograma" element={
                <ProtectedRoute session={session}>
                    <OdontogramView />
                </ProtectedRoute>
            } />
            <Route path="/update-password" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
