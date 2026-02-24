// src/components/ModalsRoot.tsx
import React from 'react';
import { useModals } from '../hooks/useModals';

import PatientProfileModal from './PatientProfileModal';
import EditPatientModal from './EditPatientModal';
import AddPatientModal from './AddPatientModal';
import ClinicalRecordModal from './ClinicalRecordModal';
import BookingModal from './BookingModal';
import TurnoDetailsModal from './TurnoDetailsModal';
import EditTurnoModal from './EditTurnoModal';

// No external props needed — everything comes from the ModalsContext
export default function ModalsRoot() {
    const {
        session,
        selectedPatient,
        showProfileModal,
        showEditModal,
        showAddModal,
        showRecordModal,
        closeProfile,
        onEditFromProfile,
        onViewPatient,
        onCreatedPatient,
        onDeletePatient,

        selectedTurno,
        showBookingModal,
        showTurnoDetailsModal,
        showEditTurnoModal,
        closeBookingModal,
        onBookingSuccess,
        onEditTurnoFromDetails,
        onDeleteTurnoFromDetails,
        closeTurnoDetails,
        closeEditTurno,
        onTurnoSaved,
        onTurnoDeleted,
        onViewTurno,
        closeAddPatient,
        closeEditPatient,
        closeRecordModal,
        onOpenRecord,
    } = useModals();

    return (
        <>
            <PatientProfileModal
                open={showProfileModal}
                patient={selectedPatient}
                onClose={closeProfile}
                onEdit={onEditFromProfile}
                onDelete={onDeletePatient}
                onMessage={undefined}
                onOpenRecord={onOpenRecord}
            />

            <EditPatientModal
                open={showEditModal}
                patient={selectedPatient}
                onClose={closeEditPatient}
                onBack={() => {
                    closeEditPatient();
                    if (selectedPatient) onViewPatient(selectedPatient);
                }}
            />

            <AddPatientModal
                open={showAddModal}
                onClose={closeAddPatient}
                onCreate={onCreatedPatient}
                onCreated={undefined}
            />

            <ClinicalRecordModal
                open={showRecordModal}
                patient={selectedPatient}
                onClose={closeRecordModal}
                session={session}
            />

            <BookingModal
                open={showBookingModal}
                onClose={closeBookingModal}
                onSuccess={onBookingSuccess}
            />

            <TurnoDetailsModal
                open={showTurnoDetailsModal}
                turno={selectedTurno}
                onClose={closeTurnoDetails}
                onEdit={onEditTurnoFromDetails}
                onDelete={onDeleteTurnoFromDetails}
            />

            <EditTurnoModal
                open={showEditTurnoModal}
                turno={selectedTurno}
                onClose={closeEditTurno}
                onSaved={onTurnoSaved}
                onDeleted={onTurnoDeleted}
                onBack={() => {
                    closeEditTurno();
                    if (selectedTurno) onViewTurno(selectedTurno);
                }}
            />
        </>
    );
}
