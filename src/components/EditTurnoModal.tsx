// src/components/EditTurnoModal.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Calendar, Clock, User, CreditCard, AlertCircle, CheckCircle, Loader, X, ArrowLeft } from 'lucide-react';
import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import './loader-spin.css';
import { combineDateTimeToISO } from '../utils/helpers';
import { message } from 'antd';

interface TurnoForm {
    id: string; dni: string; nombre: string; telefono: string; email: string;
    obraSocial: string; numeroAfiliado: string; alergias: string; antecedentes: string;
    tipoTurno: string; fecha: string; hora: string; notas: string;
}

interface EditTurnoModalProps {
    open: boolean;
    turno: any;
    onClose: () => void;
    onSaved?: (saved: any) => void;
    onDeleted?: (turno: any) => void;
    onBack?: () => void;
}

const emptyForm: TurnoForm = { id: '', dni: '', nombre: '', telefono: '', email: '', obraSocial: '', numeroAfiliado: '', alergias: '', antecedentes: '', tipoTurno: '', fecha: '', hora: '', notas: '' };

export default function EditTurnoModal({ open, turno, onClose, onSaved, onDeleted, onBack }: EditTurnoModalProps) {
    const [formData, setFormData] = useState<TurnoForm>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [checkingPatient, setCheckingPatient] = useState(false);
    const [patientFound, setPatientFound] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [activeWorkingDays, setActiveWorkingDays] = useState<number[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const freedRef = useRef(false);

    useEffect(() => {
        AppointmentService.getActiveWorkingDays().then(setActiveWorkingDays).catch(() => { });
        AppointmentService.getServices().then(setServices).catch(() => { });
    }, []);

    const getAvailableSlots = useCallback(async (fecha: string, tipoTurno: string, excludeId?: string) => {
        if (!fecha || !tipoTurno) return;
        setLoadingAvailability(true);
        try {
            const apptType = services.find(t => t.id === tipoTurno || t.name === tipoTurno);
            const slots = await AppointmentService.getAvailableSlots(fecha, apptType?.duration || 30, excludeId || formData.id);
            setAvailableSlots(slots);
        } catch { setAvailableSlots([]); }
        finally { setLoadingAvailability(false); }
    }, [formData.id, services]);

    useEffect(() => {
        if (open && turno) {
            const startDate = turno.start || turno.startTime;
            let fecha = '', hora = '';
            if (startDate) {
                const d = new Date(startDate);
                if (!isNaN(d.getTime())) { fecha = d.toISOString().split('T')[0]; hora = d.toTimeString().slice(0, 5); }
            }
            const tipoTurno = (services.find(type => (turno.title || '').toLowerCase().includes(type.name.toLowerCase()) || (turno.tipoTurno || '').toLowerCase() === (type.id || '').toLowerCase()) || {}).id || turno.tipoTurno || '';
            let dniInicial = turno.patientDni || turno.dni || '';
            if (!dniInicial) {
                const text = String(turno.description || '');
                const m1 = text.match(/dni\s*[:\-]?\s*([0-9\.\s]+)/i);
                if (m1?.[1]) dniInicial = String(m1[1]).replace(/\D/g, '');
                else { const m2 = text.match(/(^|\D)(\d{7,9})(?!\d)/); if (m2?.[2]) dniInicial = m2[2]; }
            }
            dniInicial = String(dniInicial || '').replace(/\D/g, '');
            const nombreDesdeDesc = (() => { const m = String(turno.description || '').match(/Paciente\s*[:\-]?\s*(.+?)(?=\s*(DNI|Dni|dni)\b|$)/); return m?.[1]?.trim() || ''; })();
            const idTurno = turno.id || turno.eventId || turno._id || '';
            setFormData({ id: idTurno, dni: dniInicial, nombre: turno.patientName || turno.paciente || nombreDesdeDesc || '', telefono: turno.patientPhone || '', email: turno.patientEmail || '', obraSocial: turno.obraSocial || '', numeroAfiliado: turno.numeroAfiliado || '', alergias: turno.alergias || '', antecedentes: turno.antecedentes || '', tipoTurno, fecha, hora, notas: turno.description || '' });
            setPatientFound(false); setError('');
            if (dniInicial) checkPatient(dniInicial);
            if (fecha && tipoTurno) getAvailableSlots(fecha, tipoTurno, idTurno);
        }
    }, [open, turno, services]);

    useEffect(() => { if (!open) freedRef.current = false; }, [open]);

    useEffect(() => {
        if (!open || !formData.fecha || !formData.tipoTurno) return;
        getAvailableSlots(formData.fecha, formData.tipoTurno, formData.id);
    }, [open, formData.fecha, formData.tipoTurno]);

    const checkPatient = async (dni: string) => {
        if (!dni || String(dni).replace(/\D/g, '').length < 7) { setPatientFound(false); return; }
        setCheckingPatient(true); setError('');
        try {
            const patient = await PatientService.getPatientByDni(dni);
            if (patient) {
                setFormData(prev => ({ ...prev, nombre: patient.nombre || prev.nombre, telefono: patient.telefono || prev.telefono, email: patient.email || prev.email, obraSocial: patient.obraSocial || prev.obraSocial, numeroAfiliado: patient.numeroAfiliado || prev.numeroAfiliado, alergias: patient.alergias || 'Ninguna', antecedentes: patient.antecedentes || 'Ninguno' }));
                setPatientFound(true);
            } else setPatientFound(false);
        } catch { setError('Error al consultar paciente.'); setPatientFound(false); }
        finally { setCheckingPatient(false); }
    };

    const availableDates = useMemo(() => {
        if (!activeWorkingDays.length) return [];
        const dates: { value: string; label: string }[] = [];
        const today = new Date();
        for (let i = 0; i <= 14; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            const value = d.toISOString().split('T')[0];
            if (activeWorkingDays.includes(d.getDay()) || value === formData.fecha) {
                dates.push({ value, label: d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' }) });
            }
        }
        return dates;
    }, [formData.fecha, activeWorkingDays]);

    const handleInputChange = (field: keyof TurnoForm, value: string) => {
        if (field === 'fecha' || field === 'tipoTurno') {
            const next = { ...formData, [field]: value, hora: '' };
            setFormData(next);
            if (next.fecha && next.tipoTurno) getAvailableSlots(next.fecha, next.tipoTurno, next.id || formData.id);
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'dni') checkPatient(value);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const apptType = services.find(t => t.id === formData.tipoTurno || t.name === formData.tipoTurno);
            const payload = { dni: formData.dni, nombre: formData.nombre, telefono: formData.telefono, email: formData.email, obraSocial: formData.obraSocial, numeroAfiliado: formData.numeroAfiliado, alergias: formData.alergias || 'Ninguna', antecedentes: formData.antecedentes || 'Ninguno', tipoTurno: formData.tipoTurno, tipoTurnoNombre: apptType?.name || 'Consulta', duracion: apptType?.duration || 30, fechaHora: combineDateTimeToISO(formData.fecha, formData.hora, 'America/Argentina/Buenos_Aires'), timezone: 'America/Argentina/Buenos_Aires', notas: formData.notas, isNewPatient: !patientFound };
            const saved = freedRef.current || !formData.id ? await AppointmentService.createAppointment(payload) : await AppointmentService.updateAppointment(formData.id, payload);
            onSaved?.(saved); message.success('Turno guardado con éxito'); onClose();
        } catch (err: any) { const msg = err.message || 'Error al actualizar.'; setError(msg); message.error(msg); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        setDeleting(true); setError('');
        try {
            await AppointmentService.deleteAppointment(formData.id);
            onDeleted?.(turno); message.success('Turno cancelado correctamente'); onClose();
        } catch (err: any) { const msg = err.message || 'Error al cancelar.'; setError(msg); message.error(msg); }
        finally { setDeleting(false); }
    };

    const isFormValid = () => !!(formData.dni && formData.nombre && formData.tipoTurno && formData.fecha && formData.hora);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4 overflow-hidden">
                <div className="relative bg-white rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
                    <div className="sticky top-0 z-[1] bg-white/80 backdrop-blur border-b px-6 min-h-[75px] flex items-center relative">
                        <div className="flex-1 flex items-center gap-1">
                            {onBack && <button onClick={onBack} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-900" aria-label="Volver"><ArrowLeft size={20} /></button>}
                            <h2 className="text-xl font-semibold text-gray-900">Editar Turno</h2>
                        </div>
                        <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 text-gray-900" aria-label="Cerrar"><X size={20} /></button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <form id="edit-turno-form" onSubmit={handleSave} className="p-6 space-y-6 pb-8">
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><CreditCard className="inline w-4 h-4 mr-1" />DNI</label>
                                <div className="relative">
                                    <input type="text" value={formData.dni} readOnly className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] text-gray-700 cursor-not-allowed" />
                                    {checkingPatient && <Loader className="absolute right-3 top-2 w-5 h-5 text-gray-400 animate-spin" />}
                                </div>
                                {patientFound && <p className="text-teal-600 text-sm mt-1 flex items-center gap-1"><CheckCircle size={16} />Paciente encontrado</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><User className="inline w-4 h-4 mr-1" />Nombre</label>
                                <input type="text" value={formData.nombre} readOnly className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] text-gray-700 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="paciente@correo.com" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="inline w-4 h-4 mr-1" />Tipo de Turno</label>
                                <select value={formData.tipoTurno} onChange={e => handleInputChange('tipoTurno', e.target.value)} className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5]" required>
                                    <option value="">Selecciona el tipo de consulta</option>
                                    {services.map(type => <option key={type.id || type.name} value={type.id || type.name}>{type.name} ({type.duration} min)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="inline w-4 h-4 mr-1" />Fecha</label>
                                <select value={formData.fecha} onChange={e => handleInputChange('fecha', e.target.value)} className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5]" required>
                                    <option value="">Selecciona una fecha</option>
                                    {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </select>
                            </div>
                            {formData.fecha && formData.tipoTurno && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="inline w-4 h-4 mr-1" />Horario Disponible</label>
                                    {loadingAvailability ? (
                                        <div className="flex items-center gap-2 p-3 text-gray-600"><Loader className="w-5 h-5 animate-spin" />Cargando horarios...</div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button key={slot} type="button" onClick={() => handleInputChange('hora', slot)} className={`p-3 text-sm rounded-lg border transition-colors ${formData.hora === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500'}`}>{slot} hs</button>
                                            ))}
                                        </div>
                                    )}
                                    {!loadingAvailability && !availableSlots.length && <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">No hay horarios disponibles.</p>}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales</label>
                                <textarea value={formData.notas} onChange={e => handleInputChange('notas', e.target.value)} rows={3} placeholder="Información adicional..." className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5]" />
                            </div>
                        </form>
                    </div>
                    <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t px-6 py-4 flex flex-col sm:flex-row gap-3">
                        <button type="button" onClick={() => setShowConfirm(true)} disabled={deleting || loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50">Cancelar Turno</button>
                        <button type="submit" form="edit-turno-form" disabled={!isFormValid() || loading || deleting} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50">
                            {loading ? <><Loader className="w-5 h-5 animate-spin inline mr-2" />Guardando...</> : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancelar turno</h3>
                        <p className="text-sm text-gray-600 mb-6">¿Confirmás la cancelación de este turno? Esta acción no se puede deshacer.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Volver</button>
                            <button type="button" onClick={() => { setShowConfirm(false); handleDelete(); }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Cancelar turno</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
