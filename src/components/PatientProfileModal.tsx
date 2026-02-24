// src/components/PatientProfileModal.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalShell from './ModalShell';
import { User, Hash, Phone, Building2, FileText, AlertTriangle, Activity, Stethoscope } from 'lucide-react';
import { initials } from '../utils/helpers';
import { message } from 'antd';

interface PatientProfileModalProps {
    open: boolean; patient: any; onClose: () => void;
    onEdit?: (patient: any) => void; onDelete?: (patient: any) => Promise<void>;
    onMessage?: (patient: any) => void; onOpenRecord?: (patient: any) => void;
}

interface InfoRowProps { icon: React.ElementType; label: string; value: React.ReactNode; className?: string; }
const InfoRow = ({ icon: Icon, label, value, className = '' }: InfoRowProps) => (
    <div className="flex items-start py-2 gap-3">
        <div className="flex items-center min-w-[120px] text-sm font-medium text-gray-600"><Icon size={16} className="mr-2 text-gray-500" />{label}:</div>
        <div className={`text-sm text-gray-900 break-words min-w-0 ${className}`}>{value}</div>
    </div>
);

export default function PatientProfileModal({ open, patient, onClose, onEdit, onDelete, onMessage, onOpenRecord }: PatientProfileModalProps) {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { if (!open) { setShowConfirm(false); setDeleting(false); } }, [open]);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { if (showConfirm) { setShowConfirm(false); setDeleting(false); } else { onClose(); } }
        };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose, showConfirm]);

    if (!open || !patient) return null;

    const getField = (p: any, fields: string[], def = '-') => {
        for (const f of fields) { const v = p[f] ?? p.fields?.[f]; if (v != null && v !== '') return String(v); }
        return def;
    };

    const nombre = getField(patient, ['nombre', 'name'], 'Sin nombre');
    const dni = getField(patient, ['dni', 'DNI']);
    const telefono = getField(patient, ['telefono', 'phone']);
    const email = getField(patient, ['email', 'correo'], '-');
    const obraSocial = getField(patient, ['obraSocial', 'obra_social']);
    const numeroAfiliado = getField(patient, ['numeroAfiliado', 'numero_afiliado']);
    const alergias = getField(patient, ['alergias', 'alergia'], 'Ninguna');
    const antecedentes = getField(patient, ['antecedentes'], 'Ninguno');
    const historiaClinicaUrl = getField(patient, ['historiaClinicaUrl', 'historia_clinica', 'historia_clinica_url', 'historiaClinica'], 'Sin archivo');
    const estado = getField(patient, ['estado'], 'Activo');
    const notas = getField(patient, ['notas', 'observaciones'], 'Sin notas');

    const getEstadoColor = (e: string) => {
        const l = e.toLowerCase();
        if (l.includes('activo')) return 'bg-green-100 text-green-800';
        if (l.includes('tratamiento')) return 'bg-blue-100 text-blue-800';
        if (l.includes('alta')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const confirmDelete = async () => {
        if (!onDelete || !patient || deleting) return;
        try {
            setDeleting(true); await onDelete(patient); setShowConfirm(false); setDeleting(false); onClose?.();
        } catch (e: any) { setDeleting(false); message.error(`Error al eliminar: ${e.message || 'Intente nuevamente'}`); }
    };

    if (showConfirm) {
        return (
            <ModalShell title="Confirmar Eliminación" onClose={() => setShowConfirm(false)}>
                <div className="py-4">
                    <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar a <strong>{nombre}</strong>?</p>
                    <p className="text-sm text-red-600 mb-6">Esta acción no se puede deshacer.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" disabled={deleting}>Cancelar</button>
                        <button onClick={confirmDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400">{deleting ? 'Eliminando...' : 'Eliminar'}</button>
                    </div>
                </div>
            </ModalShell>
        );
    }

    const hasFile = historiaClinicaUrl && historiaClinicaUrl !== '-' && historiaClinicaUrl !== 'Sin archivo';

    return (
        <ModalShell title="Perfil del Paciente" onClose={onClose} footer={
            <div className="flex gap-3">
                {onMessage && <button type="button" className="hidden sm:flex items-center justify-center h-12 px-6 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-base" onClick={() => onMessage(patient)}>Mensaje</button>}
                <button type="button" className="flex-1 h-12 px-6 rounded-xl bg-red-600 text-white hover:bg-red-700 text-base font-semibold" onClick={() => setShowConfirm(true)}>Eliminar</button>
                <button className="flex-1 h-12 px-6 rounded-xl bg-teal-600 text-white hover:bg-emerald-700 text-base font-semibold" onClick={() => onEdit?.(patient)}>Editar</button>
            </div>
        }>
            <div className="py-6 overflow-x-hidden">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 text-2xl font-semibold mb-4">{initials(nombre)}</div>
                    <div className="text-xl font-semibold text-gray-900">{nombre}</div>
                    <div className="text-sm text-gray-500">{obraSocial}</div>
                    <div className="mt-2"><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(estado)}`}>{estado}</span></div>
                </div>
                <hr className="my-6" />
                <div className="space-y-1">
                    <InfoRow icon={User} label="Nombre" value={nombre} />
                    <InfoRow icon={Hash} label="DNI" value={dni} />
                    <InfoRow icon={Phone} label="Teléfono" value={telefono} />
                    <InfoRow icon={FileText} label="Email" value={email} />
                    <InfoRow icon={Building2} label="Obra Social" value={obraSocial} />
                    <InfoRow icon={Hash} label="N° de Afiliado" value={numeroAfiliado} />
                    <InfoRow icon={AlertTriangle} label="Alergias" value={alergias} className={alergias !== 'Ninguna' && alergias !== '-' ? 'text-red-600 font-medium' : ''} />
                    <InfoRow icon={Stethoscope} label="Antecedentes" value={antecedentes} />
                    <InfoRow icon={FileText} label="Historia Clínica" value={
                        <button onClick={() => onOpenRecord?.(patient)} className={`${hasFile ? 'text-emerald-600 hover:text-emerald-700' : 'text-orange-600 hover:text-orange-700'} underline font-bold text-left`}>
                            {hasFile ? 'Ver Historia Clínica' : 'Subir Historia Clínica'}
                        </button>
                    } />
                    <InfoRow icon={Activity} label="Odontograma" value={
                        <button onClick={() => { onClose?.(); navigate(`/pacientes/${patient.id}/odontograma`); }} className="text-teal-600 underline hover:text-teal-700 font-medium">Abrir Odontograma</button>
                    } />
                    <InfoRow icon={Activity} label="Estado" value={<span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoColor(estado)}`}>{estado}</span>} />
                    {notas && notas !== '-' && notas !== 'Sin notas' && (
                        <div className="pt-4 border-t mt-4">
                            <div className="flex items-center min-w-[120px] text-sm font-medium text-gray-600"><FileText size={16} className="mr-2 text-gray-500" />Notas:</div>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{notas}</div>
                        </div>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
