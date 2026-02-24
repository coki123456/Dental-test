import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { AppointmentService } from '../services/AppointmentService';
import type { NormalizedPatient } from './useNormalizedPatients';
import type { NormalizedAppointment } from '../services/AppointmentService';
import type { PatientPayload } from '../services/PatientService';

// ─── Context type ────────────────────────────────────────────
interface ModalsContextValue {
    // Patient state
    selectedPatient: (NormalizedPatient & { historiaUrl?: string }) | null;
    showProfileModal: boolean;
    showEditModal: boolean;
    showAddModal: boolean;
    showRecordModal: boolean;
    // Turno state
    selectedTurno: NormalizedAppointment | null;
    showBookingModal: boolean;
    showTurnoDetailsModal: boolean;
    showEditTurnoModal: boolean;
    // Patient actions
    closeProfile: () => void;
    onViewPatient: (patient: NormalizedPatient) => void;
    onEditFromProfile: (patient: NormalizedPatient) => void;
    openAddPatient: () => void;
    closeAddPatient: () => void;
    closeEditPatient: () => void;
    onOpenRecord: (p: NormalizedPatient) => void;
    closeRecordModal: () => void;
    onSavedPatient: (data: PatientPayload) => Promise<void>;
    onCreatedPatient: (data: PatientPayload) => Promise<any>;
    // Turno actions
    openBookingModal: () => void;
    closeBookingModal: () => void;
    onViewTurno: (turno: NormalizedAppointment) => void;
    onEditTurnoFromDetails: (turno: NormalizedAppointment) => void;
    onDeleteTurnoFromDetails: (turno: NormalizedAppointment) => Promise<void>;
    closeTurnoDetails: () => void;
    closeEditTurno: () => void;
    onBookingSuccess: () => void;
    onTurnoSaved: (updated: NormalizedAppointment) => void;
    onTurnoDeleted: (deleted: NormalizedAppointment) => void;
}

interface ModalsProviderProps {
    children: React.ReactNode;
    patients?: NormalizedPatient[];
    turnos?: NormalizedAppointment[];
    addPatient?: (data: PatientPayload) => Promise<any>;
    updatePatient?: (data: PatientPayload) => Promise<any>;
    refreshTurnos?: () => void;
    refreshPatients?: () => void;
}

// ─── Context ─────────────────────────────────────────────────
const ModalsContext = createContext<ModalsContextValue | null>(null);

export function ModalsProvider({
    children,
    patients = [],
    turnos = [],
    addPatient,
    updatePatient,
    refreshTurnos,
    refreshPatients,
}: ModalsProviderProps) {
    // Patient state
    const [selectedPatient, setSelectedPatient] = useState<(NormalizedPatient & { historiaUrl?: string }) | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);

    // Turno state
    const [selectedTurno, setSelectedTurno] = useState<NormalizedAppointment | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showTurnoDetailsModal, setShowTurnoDetailsModal] = useState(false);
    const [showEditTurnoModal, setShowEditTurnoModal] = useState(false);

    // ── Patient actions ────────────────────────────────────────
    const closeProfile = useCallback(() => {
        setShowProfileModal(false);
        setSelectedPatient(null);
    }, []);

    const onViewPatient = useCallback((patient: NormalizedPatient) => {
        setSelectedPatient(patient);
        setShowProfileModal(true);
    }, []);

    const onEditFromProfile = useCallback((patient: NormalizedPatient) => {
        setSelectedPatient(patient);
        setShowProfileModal(false);
        setShowEditModal(true);
    }, []);

    const openAddPatient = useCallback(() => setShowAddModal(true), []);
    const closeAddPatient = useCallback(() => setShowAddModal(false), []);
    const closeEditPatient = useCallback(() => setShowEditModal(false), []);

    const closeRecordModal = useCallback(() => setShowRecordModal(false), []);

    const onOpenRecord = useCallback((p: NormalizedPatient) => {
        const historiaUrl =
            (p as any)?.historiaUrl ||
            p?.historiaClinicaUrl ||
            (p as any)?.historiaClinica ||
            '';
        setSelectedPatient({ ...p, historiaUrl });
        setShowRecordModal(true);
    }, []);

    // ── Turno actions ─────────────────────────────────────────
    const openBookingModal = useCallback(() => setShowBookingModal(true), []);
    const closeBookingModal = useCallback(() => setShowBookingModal(false), []);

    const onViewTurno = useCallback((turno: NormalizedAppointment) => {
        setSelectedTurno(turno);
        setShowTurnoDetailsModal(true);
    }, []);

    const onEditTurnoFromDetails = useCallback((turno: NormalizedAppointment) => {
        setSelectedTurno(turno);
        setShowTurnoDetailsModal(false);
        setShowEditTurnoModal(true);
    }, []);

    const closeTurnoDetails = useCallback(() => {
        setShowTurnoDetailsModal(false);
        setSelectedTurno(null);
    }, []);

    const closeEditTurno = useCallback(() => {
        setShowEditTurnoModal(false);
        setSelectedTurno(null);
    }, []);

    // ── Cross-cutting data actions ────────────────────────────
    const onBookingSuccess = useCallback(() => {
        refreshTurnos?.();
        refreshPatients?.();
        try {
            window.dispatchEvent(new CustomEvent('turnos:refresh'));
            window.dispatchEvent(new CustomEvent('patients:refresh'));
        } catch { }
        closeBookingModal();
    }, [refreshTurnos, refreshPatients, closeBookingModal]);

    const onTurnoSaved = useCallback((_updated: NormalizedAppointment) => {
        refreshTurnos?.();
        try { window.dispatchEvent(new CustomEvent('turnos:refresh')); } catch { }
        setShowEditTurnoModal(false);
        setSelectedTurno(null);
    }, [refreshTurnos]);

    const onTurnoDeleted = useCallback((deletedTurno: NormalizedAppointment) => {
        refreshTurnos?.();
        try {
            const id = deletedTurno?.id || (deletedTurno as any)?.eventId;
            window.dispatchEvent(new CustomEvent('turnos:refresh'));
            if (id) window.dispatchEvent(new CustomEvent('turnos:deleted', { detail: { id } }));
        } catch { }
        setShowEditTurnoModal(false);
        setShowTurnoDetailsModal(false);
        setSelectedTurno(null);
    }, [refreshTurnos]);

    const onDeleteTurnoFromDetails = useCallback(async (turno: NormalizedAppointment) => {
        const id = turno?.id || (turno as any)?.eventId;
        if (!id) { alert('No se pudo identificar el turno a cancelar'); return; }
        try {
            await AppointmentService.deleteAppointment(id);
            onTurnoDeleted({ ...turno, id });
        } catch (err: any) {
            alert(err.message || 'No se pudo cancelar el turno.');
        }
    }, [onTurnoDeleted]);

    const onSavedPatient = useCallback(async (updatedPatientData: PatientPayload) => {
        try {
            if (typeof updatePatient === 'function') await updatePatient(updatedPatientData);
            refreshPatients?.();
            window.dispatchEvent(new CustomEvent('patients:refresh'));
            setShowEditModal(false);
            setSelectedPatient(null);
        } catch (err: any) {
            alert(`Error: ${err.message || 'No se pudo actualizar el paciente'}`);
        }
    }, [updatePatient, refreshPatients]);

    const onCreatedPatient = useCallback(async (patientData: PatientPayload) => {
        try {
            const res = typeof addPatient === 'function' ? await addPatient(patientData) : null;
            setShowAddModal(false);
            const fallback = {
                ...patientData,
                id: patientData?.id || patientData?.dni || String(Date.now()),
                fechaCreacion: patientData?.createdTime || new Date().toISOString().slice(0, 10),
                _createdAt: Date.now(),
            };
            const created = (Array.isArray(res) ? res[0]?.patient : res?.patient) || res || fallback;
            refreshPatients?.();
            window.dispatchEvent(new CustomEvent('patients:refresh'));
            return created;
        } catch (err: any) {
            alert(`Error: ${err.message || 'No se pudo crear el paciente'}`);
            throw err;
        }
    }, [addPatient, refreshPatients]);

    // ── Sync selectedPatient when list updates ────────────────
    React.useEffect(() => {
        if (selectedPatient && Array.isArray(patients)) {
            const updated = patients.find(
                (p) => (p.id) === (selectedPatient.id)
            );
            if (updated) {
                const { historiaUrl: currentUrl, ...currentRest } = selectedPatient as any;
                const { historiaUrl: _newUrl, ...newRest } = updated as any;
                if (JSON.stringify(currentRest) !== JSON.stringify(newRest)) {
                    setSelectedPatient((prev) => ({ ...updated, historiaUrl: prev?.historiaUrl }));
                }
            }
        }
    }, [selectedPatient, patients]);

    // ── Sync selectedTurno when list updates ─────────────────
    React.useEffect(() => {
        if (selectedTurno && Array.isArray(turnos)) {
            const idSearch = selectedTurno.id;
            const updated = turnos.find((t) => t.id === idSearch);
            if (updated && JSON.stringify(selectedTurno) !== JSON.stringify(updated)) {
                setSelectedTurno(updated);
            }
        }
    }, [selectedTurno, turnos]);

    // ── Global event listener (compatibility layer) ───────────
    React.useEffect(() => {
        const handleRefresh = () => refreshPatients?.();
        window.addEventListener('patients:refresh', handleRefresh);
        return () => window.removeEventListener('patients:refresh', handleRefresh);
    }, [refreshPatients]);

    // ── Memoized context value ────────────────────────────────
    const value = useMemo<ModalsContextValue>(
        () => ({
            selectedPatient, showProfileModal, showEditModal, showAddModal, showRecordModal,
            selectedTurno, showBookingModal, showTurnoDetailsModal, showEditTurnoModal,
            closeProfile, onViewPatient, onEditFromProfile,
            openAddPatient, closeAddPatient, closeEditPatient,
            onOpenRecord, closeRecordModal, onSavedPatient, onCreatedPatient,
            openBookingModal, closeBookingModal,
            onViewTurno, onEditTurnoFromDetails, onDeleteTurnoFromDetails,
            closeTurnoDetails, closeEditTurno,
            onBookingSuccess, onTurnoSaved, onTurnoDeleted,
        }),
        [
            selectedPatient, showProfileModal, showEditModal, showAddModal, showRecordModal,
            selectedTurno, showBookingModal, showTurnoDetailsModal, showEditTurnoModal,
            closeProfile, onViewPatient, onEditFromProfile,
            openAddPatient, closeAddPatient, closeEditPatient,
            onOpenRecord, closeRecordModal, onSavedPatient, onCreatedPatient,
            openBookingModal, closeBookingModal,
            onViewTurno, onEditTurnoFromDetails, onDeleteTurnoFromDetails,
            closeTurnoDetails, closeEditTurno,
            onBookingSuccess, onTurnoSaved, onTurnoDeleted,
        ]
    );

    return <ModalsContext.Provider value={ value }> { children } </ModalsContext.Provider>;
}

export function useModals(): ModalsContextValue {
    const ctx = useContext(ModalsContext);
    if (!ctx) throw new Error('useModals must be used within a ModalsProvider');
    return ctx;
}
