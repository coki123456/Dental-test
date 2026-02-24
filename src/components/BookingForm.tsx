// src/components/BookingForm.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Clock, User, CreditCard, Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import './loader-spin.css';
import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import InsuranceAutocomplete from './InsuranceAutocomplete';
import { combineDateTimeToISO } from '../utils/helpers';
import { message } from 'antd';

interface BookingFormData {
    dni: string; nombre: string; telefono: string; email: string;
    obraSocial: string; numeroAfiliado: string; alergias: string;
    antecedentes: string; tipoTurno: string; fecha: string; hora: string;
}

interface BookingFormProps {
    onSuccess?: () => void;
    hideHeader?: boolean;
    hideInternalSubmit?: boolean;
    setFormSubmit?: (fn: () => void) => void;
}

const emptyForm: BookingFormData = { dni: '', nombre: '', telefono: '', email: '', obraSocial: '', numeroAfiliado: '', alergias: '', antecedentes: '', tipoTurno: '', fecha: '', hora: '' };

export default function BookingForm({ onSuccess, hideHeader = false, hideInternalSubmit = false, setFormSubmit }: BookingFormProps) {
    const [formData, setFormData] = useState<BookingFormData>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [checkingPatient, setCheckingPatient] = useState(false);
    const [patientFound, setPatientFound] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [patientNotice, setPatientNotice] = useState('');
    const [activeWorkingDays, setActiveWorkingDays] = useState<number[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const formRef = useRef<HTMLFormElement>(null);
    const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        Promise.all([AppointmentService.getActiveWorkingDays(), AppointmentService.getServices()]).then(([days, servs]) => { setActiveWorkingDays(days); setServices(servs); }).catch(() => { });
    }, []);

    useEffect(() => {
        if (typeof setFormSubmit === 'function') {
            setFormSubmit(() => () => {
                try { if (formRef.current?.requestSubmit) formRef.current.requestSubmit(hiddenSubmitRef.current || undefined); else hiddenSubmitRef.current?.click(); }
                catch { try { hiddenSubmitRef.current?.click(); } catch { } }
            });
        }
    }, [setFormSubmit]);

    const checkPatient = async (dni: string) => {
        if (dni.length < 7) { setPatientFound(false); setPatientNotice(''); return; }
        setCheckingPatient(true); setError(''); setPatientNotice('');
        try {
            const patient = await PatientService.getPatientByDni(dni);
            if (patient) {
                setFormData(prev => ({ ...prev, nombre: patient.nombre || '', telefono: patient.telefono || '', email: patient.email || '', obraSocial: patient.obraSocial || '', numeroAfiliado: patient.numeroAfiliado || '', alergias: patient.alergias || 'Ninguna', antecedentes: patient.antecedentes || 'Ninguno' }));
                setPatientFound(true);
            } else {
                setFormData(prev => ({ ...prev, nombre: '', telefono: '', email: '', obraSocial: '', numeroAfiliado: '', alergias: '', antecedentes: '' }));
                setPatientFound(false); setPatientNotice('Paciente nuevo: se creará automáticamente al confirmar.');
            }
        } catch { setPatientNotice('Error al buscar paciente'); setPatientFound(false); }
        finally { setCheckingPatient(false); }
    };

    const getAvailableSlots = async (fecha: string, tipoTurno: string) => {
        if (!fecha || !tipoTurno) return;
        setLoadingAvailability(true);
        try {
            const apptType = services.find(t => t.id === tipoTurno || t.name === tipoTurno);
            setAvailableSlots(await AppointmentService.getAvailableSlots(fecha, apptType?.duration || 30));
        } catch { setAvailableSlots([]); }
        finally { setLoadingAvailability(false); }
    };

    const availableDates = useMemo(() => {
        if (!activeWorkingDays.length) return [];
        const dates: { value: string; label: string }[] = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
            if (activeWorkingDays.includes(d.getDay())) dates.push({ value: `${y}-${m}-${day}`, label: d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' }) });
        }
        return dates;
    }, [activeWorkingDays]);

    const handleInputChange = (field: keyof BookingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'dni') { setPatientNotice(''); checkPatient(value); }
        if (field === 'fecha' || field === 'tipoTurno') {
            const next = { ...formData, [field]: value };
            if (next.fecha && next.tipoTurno) getAvailableSlots(next.fecha, next.tipoTurno);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const apptType = services.find(t => t.id === formData.tipoTurno || t.name === formData.tipoTurno);
            await AppointmentService.createAppointment({ dni: formData.dni, nombre: formData.nombre, telefono: formData.telefono, email: formData.email, obraSocial: formData.obraSocial, numeroAfiliado: formData.numeroAfiliado, alergias: formData.alergias || 'Ninguna', antecedentes: formData.antecedentes || 'Ninguno', tipoTurno: formData.tipoTurno, tipoTurnoNombre: apptType?.name || formData.tipoTurno, duracion: apptType?.duration || 30, fechaHora: combineDateTimeToISO(formData.fecha, formData.hora, 'America/Argentina/Buenos_Aires'), timezone: 'America/Argentina/Buenos_Aires', isNewPatient: !patientFound, notas: '' });
            setSuccess(true);
            setTimeout(() => { onSuccess?.(); }, 2000);
        } catch (err: any) { const msg = err.message || 'Error al crear el turno.'; setError(msg); message.error(msg); }
        finally { setLoading(false); }
    };

    const isFormValid = () => !!(formData.dni && formData.nombre && formData.telefono && formData.tipoTurno && formData.fecha && formData.hora);

    const resetForm = () => { setFormData(emptyForm); setSuccess(false); setError(''); setPatientFound(false); setAvailableSlots([]); };

    if (success) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Turno Confirmado!</h2>
                <p className="text-gray-600 mb-6">El turno ha sido agendado exitosamente.</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-gray-600">Fecha:</span><span className="font-medium">{availableDates.find(d => d.value === formData.fecha)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Hora:</span><span className="font-medium">{formData.hora} hs</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tipo:</span><span className="font-medium">{services.find(t => t.id === formData.tipoTurno || t.name === formData.tipoTurno)?.name || formData.tipoTurno}</span></div>
                </div>
                <button onClick={resetForm} className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700">Agendar Otro Turno</button>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {!hideHeader && (
                <div className="sticky top-0 z-[1] bg-white/80 backdrop-blur border-b px-6 min-h-[75px] flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">Agendar Turno</h1>
                </div>
            )}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
                <button ref={hiddenSubmitRef} type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
                {patientNotice && <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-lg text-sm">{patientNotice}</div>}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><CreditCard className="inline w-4 h-4 mr-1" />DNI</label>
                    <div className="relative">
                        <input type="text" value={formData.dni} onChange={e => handleInputChange('dni', e.target.value)} placeholder="12.345.678" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" required />
                        {checkingPatient && <Loader className="absolute right-3 top-2 w-5 h-5 text-gray-400 spin-in-place" />}
                    </div>
                    {patientFound && <p className="text-teal-600 text-sm mt-1 flex items-center gap-1"><CheckCircle size={16} />¡Paciente encontrado!</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><User className="inline w-4 h-4 mr-1" />Nombre Completo</label>
                        <input type="text" value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} placeholder="Juan Pérez" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><Phone className="inline w-4 h-4 mr-1" />Teléfono</label>
                        <input type="tel" value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} placeholder="+54 381 123 4567" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="paciente@correo.com" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InsuranceAutocomplete value={formData.obraSocial} onChange={e => handleInputChange('obraSocial', e.target.value)} disabled={loading} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">N° de Afiliado</label>
                        <input type="text" value={formData.numeroAfiliado} onChange={e => handleInputChange('numeroAfiliado', e.target.value)} placeholder="123456789" className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                        <input type="text" value={formData.alergias} onChange={e => handleInputChange('alergias', e.target.value)} placeholder="Ninguna, Penicilina..." className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Antecedentes</label>
                        <input type="text" value={formData.antecedentes} onChange={e => handleInputChange('antecedentes', e.target.value)} placeholder="Diabetes, Hipertensión..." className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="inline w-4 h-4 mr-1" />Tipo de Turno</label>
                    <select value={formData.tipoTurno} onChange={e => handleInputChange('tipoTurno', e.target.value)} className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" required>
                        <option value="">Selecciona el tipo de consulta</option>
                        {services.map(type => <option key={type.id || type.name} value={type.id || type.name}>{type.name} ({type.duration} min)</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="inline w-4 h-4 mr-1" />Fecha</label>
                    <select value={formData.fecha} onChange={e => handleInputChange('fecha', e.target.value)} className="text-sm w-full px-3 py-2 rounded-xl border border-transparent bg-[#F5F5F5] focus:outline-none" required>
                        <option value="">Selecciona una fecha</option>
                        {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>
                {formData.fecha && formData.tipoTurno && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="inline w-4 h-4 mr-1" />Horario Disponible</label>
                        {loadingAvailability ? <div className="flex items-center gap-2 p-3 text-gray-600"><Loader className="w-5 h-5 animate-spin" />Cargando horarios...</div> : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableSlots.map(slot => <button key={slot} type="button" onClick={() => handleInputChange('hora', slot)} className={`p-3 text-sm rounded-lg border transition-colors focus:outline-none ${formData.hora === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500'}`}>{slot} hs</button>)}
                            </div>
                        )}
                        {!loadingAvailability && !availableSlots.length && <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">No hay horarios disponibles.</p>}
                    </div>
                )}
                {!hideInternalSubmit && (
                    <div className="mt-2 -mx-6 px-6 py-4 border-t bg-white/80 backdrop-blur">
                        <button type="submit" disabled={!isFormValid() || loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading ? <><Loader className="w-5 h-5 animate-spin" />Creando Turno...</> : <><Calendar className="w-5 h-5" />Confirmar Turno</>}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
