// src/components/TurnoDetailsModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, User, Phone, CreditCard, MapPin, FileText, Edit, Trash2, Loader, AlertCircle } from 'lucide-react';
import { PatientService } from '../services/PatientService';
import type { NormalizedAppointment } from '../services/AppointmentService';

interface TurnoDetailsModalProps {
    open: boolean;
    turno: NormalizedAppointment | null;
    onClose: () => void;
    onEdit?: (turno: NormalizedAppointment) => void;
    onDelete?: (turno: NormalizedAppointment) => void;
}

export default function TurnoDetailsModal({ open, turno, onClose, onEdit, onDelete }: TurnoDetailsModalProps) {
    if (!open || !turno) return null;

    const [showConfirm, setShowConfirm] = useState(false);
    const [patientLoading, setPatientLoading] = useState(false);
    const [patientError, setPatientError] = useState('');
    const [patient, setPatient] = useState<any>(null);

    const formatDateTime = (dateTimeStr: string | undefined) => {
        if (!dateTimeStr) return { date: 'Sin fecha', time: 'Sin hora' };
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return { date: 'Fecha inválida', time: 'Hora inválida' };
        return {
            date: date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' }),
            time: date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
    };

    const getDuration = () => {
        const t = turno as any;
        if (!t.start || !t.end) return null;
        const diffMs = new Date(t.end).getTime() - new Date(t.start).getTime();
        if (isNaN(diffMs)) return null;
        const m = Math.round(diffMs / 60000);
        return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`;
    };

    const t = turno as any;
    const { date, time } = formatDateTime(t.start || t.startTime);
    const duration = getDuration();

    const dni = useMemo(() => {
        const explicit = t.patientDni || t.dni;
        if (explicit) return String(explicit).replace(/\D/g, '');
        const text = String(t.description || '');
        const m1 = text.match(/dni\s*[:\-]?\s*([0-9\.\s]+)/i);
        if (m1?.[1]) { const d = String(m1[1]).replace(/\D/g, ''); if (d.length >= 7 && d.length <= 9) return d; }
        const m2 = text.match(/(^|\D)(\d{7,9})(?!\d)/);
        if (m2?.[2]) return m2[2];
        return '';
    }, [t]);

    const nameFromDescription = useMemo(() => {
        const m = String(t.description || '').match(/Paciente\s*[:\-]?\s*(.+?)(?=\s*(DNI|Dni|dni)\b|$)/);
        return m?.[1]?.trim() || '';
    }, [t]);

    useEffect(() => {
        let aborted = false;
        async function run() {
            if (!open || !dni || dni.length < 7) { setPatient(null); setPatientError(''); return; }
            setPatientLoading(true); setPatientError('');
            try {
                const data = await PatientService.getPatientByDni(dni);
                if (!aborted) setPatient(data);
            } catch { if (!aborted) { setPatientError('No se pudo obtener el paciente'); setPatient(null); } }
            finally { if (!aborted) setPatientLoading(false); }
        }
        run();
        return () => { aborted = true; };
    }, [open, dni]);

    const display = useMemo(() => {
        const safe = (v: any) => (v == null || v === '' ? null : String(v));
        return {
            name: safe(patient?.nombre || patient?.name || t.patientName || t.paciente || nameFromDescription),
            phone: safe(patient?.telefono || patient?.phone || t.patientPhone),
            dni: safe(dni),
            obraSocial: safe(patient?.obraSocial || patient?.insurance || t.obraSocial),
        };
    }, [patient, t, dni, nameFromDescription]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <div className="sticky top-0 z-[1] bg-white/80 backdrop-blur border-b px-6 min-h-[120px] py-10 flex items-center relative">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-900"><X size={20} /></button>
                        <div className="pr-12">
                            <h2 className="text-xl font-semibold text-gray-900">Detalles del Turno</h2>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-700 text-sm">
                                <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-3 py-1"><Calendar size={14} /><span className="capitalize truncate">{date}</span></div>
                                <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-3 py-1"><Clock size={14} /><span>{time} hs</span></div>
                                {duration && <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-3 py-1"><span>({duration})</span></div>}
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Información del Paciente</h3>
                                {patientLoading && <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader className="animate-spin" size={16} />Buscando paciente...</div>}
                                {!patientLoading && patientError && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle size={16} />{patientError}</div>}
                                <div className="flex items-start gap-3"><User className="text-gray-400 mt-1" size={16} /><div><p className="text-sm font-medium text-gray-900">{display.name || 'Sin nombre'}</p><p className="text-sm text-gray-500">Paciente</p></div></div>
                                {display.phone && <div className="flex items-start gap-3"><Phone className="text-gray-400 mt-1" size={16} /><div><p className="text-sm font-medium text-gray-900">{display.phone}</p><p className="text-sm text-gray-500">Teléfono</p></div></div>}
                                {display.dni && <div className="flex items-start gap-3"><CreditCard className="text-gray-400 mt-1" size={16} /><div><p className="text-sm font-medium text-gray-900">{display.dni}</p><p className="text-sm text-gray-500">DNI</p></div></div>}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Información del Turno</h3>
                                <div className="flex items-start gap-3"><Calendar className="text-gray-400 mt-1" size={16} /><div><p className="text-sm font-medium text-gray-900">{t.title || t.summary || t.tipoTurnoNombre || 'Consulta'}</p><p className="text-sm text-gray-500">Tipo de consulta</p></div></div>
                                {t.location && <div className="flex items-start gap-3"><MapPin className="text-gray-400 mt-1" size={16} /><div><p className="text-sm font-medium text-gray-900">{t.location}</p><p className="text-sm text-gray-500">Ubicación</p></div></div>}
                                <div className="flex items-start gap-3">
                                    <div className={`w-2.5 h-2.5 mt-2 rounded-full ${t.status === 'confirmed' ? 'bg-teal-600' : 'bg-yellow-500'}`} />
                                    <div><p className="text-sm font-medium text-gray-900">{t.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}</p><p className="text-sm text-gray-500">Estado</p></div>
                                </div>
                            </div>
                        </div>
                        {t.description && (
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">Notas</h3>
                                <div className="bg-[#F5F5F5] rounded-xl p-4 flex items-start gap-3"><FileText className="text-gray-400 mt-1" size={16} /><p className="text-sm text-gray-700">{t.description}</p></div>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                            <button onClick={() => setShowConfirm(true)} className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"><Trash2 size={16} />Cancelar</button>
                            <button onClick={() => onEdit?.(turno)} className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl"><Edit size={16} />Editar Turno</button>
                        </div>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancelar turno</h3>
                        <p className="text-sm text-gray-600 mb-6">¿Confirmás la cancelación? Esta acción no se puede deshacer.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Volver</button>
                            <button onClick={() => { setShowConfirm(false); onDelete?.(turno); }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Cancelar turno</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
