// src/components/EditPatientModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import ModalShell from './ModalShell';
import { User, Hash, Phone, FileText, AlertTriangle, Activity, Stethoscope, AlertCircle, X, ArrowLeft } from 'lucide-react';
import InsuranceAutocomplete from './InsuranceAutocomplete';
import { message } from 'antd';

interface PatientForm {
    nombre: string; dni: string; telefono: string; email: string;
    obraSocial: string; numeroAfiliado: string; alergias: string;
    antecedentes: string; historiaClinica: string; estado: string; notas: string;
}

interface EditPatientModalProps {
    open: boolean;
    patient: any;
    onClose: () => void;
    onSaved?: (data: any) => Promise<void>;
    onBack?: () => void;
}

const emptyForm: PatientForm = { nombre: '', dni: '', telefono: '', email: '', obraSocial: '', numeroAfiliado: '', alergias: '', antecedentes: '', historiaClinica: '', estado: 'Activo', notas: '' };

export default function EditPatientModal({ open, patient, onClose, onSaved, onBack }: EditPatientModalProps) {
    const savingRef = useRef(false);
    const [form, setForm] = useState<PatientForm>(emptyForm);
    const [historiaClinicaFile, setHistoriaClinicaFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [shouldRemoveRecord, setShouldRemoveRecord] = useState(false);
    const [originalRecord, setOriginalRecord] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHistoriaClinicaFile(e.target.files?.[0] || null);
    };

    useEffect(() => {
        if (open && patient) {
            const getValue = (val: any) => Array.isArray(val) ? val[0] || '' : val || '';
            setForm({
                nombre: getValue(patient?.nombre), dni: getValue(patient?.dni), telefono: getValue(patient?.telefono),
                email: getValue(patient?.email), obraSocial: getValue(patient?.obraSocial), numeroAfiliado: getValue(patient?.numeroAfiliado),
                alergias: getValue(patient?.alergias || patient?.alergia), antecedentes: getValue(patient?.antecedentes),
                historiaClinica: getValue(patient?.historiaClinica), estado: getValue(patient?.estado) || 'Activo', notas: getValue(patient?.notas),
            });
            setHistoriaClinicaFile(null);
            setOriginalRecord(getValue(patient?.historiaClinica));
            setShouldRemoveRecord(false); setError(''); savingRef.current = false;
        }
    }, [open, patient]);

    useEffect(() => () => { savingRef.current = false; }, []);

    if (!open || !patient) return null;

    const save = async () => {
        if (saving || savingRef.current) return;
        if (!form.nombre?.trim()) { setError('El nombre es obligatorio'); return; }
        setSaving(true); savingRef.current = true; setError('');
        try {
            const updatedPatientData: any = { ...patient, ...form, estado: form.estado || 'Activo' };
            if (historiaClinicaFile) {
                updatedPatientData.historiaClinicaFile = historiaClinicaFile;
                updatedPatientData.historiaClinicaNombre = historiaClinicaFile.name;
            } else if (shouldRemoveRecord) {
                updatedPatientData.historiaClinica = null;
                updatedPatientData.historia_clinica_url = null;
            }
            await onSaved?.(updatedPatientData);
            message.success('Paciente actualizado correctamente');
            setTimeout(onClose, 900);
        } catch (err: any) {
            const msg = err.message || 'Error actualizando el paciente';
            setError(msg); message.error(msg);
        } finally { savingRef.current = false; setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
            <div className="relative z-10 flex h-full items-center justify-center py-6 md:py-10 px-4">
                <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] md:max-h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur min-h-[75px]">
                        <div className="flex items-center gap-2">
                            {onBack && <button onClick={onBack} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-900" type="button" aria-label="Volver"><ArrowLeft size={20} /></button>}
                            <h3 className="text-xl font-semibold text-gray-900">Editar Paciente</h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" disabled={saving} aria-label="Cerrar" type="button"><X size={18} /></button>
                    </div>
                    {error && <div className="mb-4 mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm"><AlertCircle size={16} className="mr-2 shrink-0" />{error}</div>}
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-500" />Nombre *</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} type="text" placeholder="Nombre completo" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} required />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Hash size={16} className="mr-2 text-gray-500" />DNI</label>
                            <input name="dni" value={form.dni} onChange={handleChange} type="text" placeholder="Número de documento" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Phone size={16} className="mr-2 text-gray-500" />Teléfono</label>
                            <input name="telefono" value={form.telefono} onChange={handleChange} type="tel" placeholder="+54 11 5555-5555" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-500" />Email</label>
                            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="paciente@correo.com" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} />
                        </div>
                        <InsuranceAutocomplete value={form.obraSocial} onChange={handleChange} disabled={saving} />
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Hash size={16} className="mr-2 text-gray-500" />N° de Afiliado</label>
                            <input name="numeroAfiliado" value={form.numeroAfiliado} onChange={handleChange} type="text" placeholder="1234-5678-90" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><AlertTriangle size={16} className="mr-2 text-gray-500" />Alergias</label>
                            <input name="alergias" value={form.alergias} onChange={handleChange} type="text" placeholder="Ninguna / Penicilina..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={saving} />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Stethoscope size={16} className="mr-2 text-gray-500" />Antecedentes</label>
                            <textarea name="antecedentes" value={form.antecedentes} onChange={handleChange} rows={2} placeholder="Antecedentes médicos..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] text-sm px-3 py-2 resize-none focus:outline-none" disabled={saving} />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText size={16} className="mr-2 text-gray-500" />Historia Clínica (archivo)</label>
                            <div className="flex items-center">
                                <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" disabled={saving} id="edit-historia-clinica-file" />
                                <label htmlFor="edit-historia-clinica-file" className="text-sm inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F6F5] text-black hover:bg-gray-200 cursor-pointer"><FileText size={16} />Adjuntar</label>
                                {(historiaClinicaFile || (originalRecord && !shouldRemoveRecord)) && (
                                    <button type="button" onClick={() => { if (historiaClinicaFile) setHistoriaClinicaFile(null); else setShouldRemoveRecord(true); }} className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full" title="Eliminar archivo"><X size={16} /></button>
                                )}
                                <span className="ml-3 text-sm text-gray-600 truncate max-w-[12rem]">
                                    {historiaClinicaFile ? historiaClinicaFile.name : shouldRemoveRecord ? 'Archivo eliminado' : originalRecord ? `Actual: ${originalRecord}` : 'Sin archivos'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Activity size={16} className="mr-2 text-gray-500" />Estado</label>
                            <select name="estado" value={form.estado} onChange={handleChange} className="text-sm w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 focus:outline-none" disabled={saving}>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="En Tratamiento">En Tratamiento</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><FileText size={16} className="mr-2 text-gray-500" />Notas</label>
                            <textarea name="notas" value={form.notas} onChange={handleChange} rows={3} placeholder="Observaciones adicionales..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] text-sm px-3 py-2 resize-none focus:outline-none" disabled={saving} />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t bg-white/80 backdrop-blur sticky bottom-0">
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50" disabled={saving}>Cancelar</button>
                            <button onClick={save} disabled={saving || !form.nombre?.trim()} className="flex-1 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
