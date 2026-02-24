import React, { useRef, useState } from 'react';
import { X, User, Hash, Phone, FileText, AlertTriangle, Activity, Stethoscope, Paperclip } from 'lucide-react';
import InsuranceAutocomplete from './InsuranceAutocomplete';
import { message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddPatientSchema, type AddPatientInput } from '../schemas/patient.schema';

interface AddPatientModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: any) => Promise<any>;
    onCreated?: (patient: any) => void;
}

const todayISO = () => new Date().toISOString();

export default function AddPatientModal({ open: openFlag, onClose, onCreate, onCreated }: AddPatientModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachBtnRef = useRef<HTMLButtonElement>(null);

    const [historiaClinicaFile, setHistoriaClinicaFile] = useState<File | null>(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AddPatientInput>({
        resolver: zodResolver(AddPatientSchema),
        defaultValues: {
            nombre: '',
            dni: '',
            telefono: '',
            email: '',
            obraSocial: '',
            numeroAfiliado: '',
            alergias: '',
            antecedentes: '',
            notas: '',
            estado: 'Activo'
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHistoriaClinicaFile(e.target.files?.[0] || null);
        try { attachBtnRef.current?.focus({ preventScroll: true }); } catch { }
    };

    const handleClearFile = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
        setHistoriaClinicaFile(null);
        try { attachBtnRef.current?.focus({ preventScroll: true }); } catch { }
    };

    const onSubmit = async (data: AddPatientInput) => {
        try {
            const baseData: any = {
                ...data,
                id: `temp_${Date.now()}`,
                fechaCreacion: todayISO(),
                _createdAt: Date.now(),
                ultimaVisita: '-',
                historiaClinicaFile: historiaClinicaFile || null,
                hasFile: !historiaClinicaFile,
                fileName: historiaClinicaFile?.name,
                fileType: historiaClinicaFile?.type,
                fileSize: historiaClinicaFile?.size
            };
            onClose?.();
            const createdRes = await onCreate(baseData);
            const fromServer = (Array.isArray(createdRes) ? createdRes[0]?.patient : createdRes?.patient) || createdRes || {};
            const createdPatient = { ...baseData, ...fromServer, id: fromServer?.id || baseData.id, fechaCreacion: fromServer?.fechaCreacion || todayISO() };
            onCreated?.(createdPatient);
            message.success('Paciente creado correctamente');
            reset();
            setHistoriaClinicaFile(null);
        } catch (err: any) {
            message.error(`Error: ${err.message || 'No se pudo crear el paciente'}`);
        }
    };

    const handleCancel = () => {
        reset();
        setHistoriaClinicaFile(null);
        onClose();
    };

    if (!openFlag) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isSubmitting ? undefined : handleCancel} />
            <div className="relative z-10 flex h-full items-center justify-center py-6 md:py-10 px-4">
                <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] md:max-h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur min-h-[75px]">
                            <h3 className="text-xl font-semibold text-gray-900">Nuevo Paciente</h3>
                            <button type="button" onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" disabled={isSubmitting} aria-label="Cerrar"><X size={18} /></button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-500" />Nombre *</label>
                                <input {...register('nombre')} type="text" placeholder="Nombre completo del paciente" className={`w-full rounded-xl border bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none ${errors.nombre ? 'border-red-500' : 'border-transparent'}`} disabled={isSubmitting} />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Hash size={16} className="mr-2 text-gray-500" />DNI</label>
                                <input {...register('dni')} type="text" placeholder="Número de documento" className={`w-full rounded-xl border bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none ${errors.dni ? 'border-red-500' : 'border-transparent'}`} disabled={isSubmitting} />
                                {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Phone size={16} className="mr-2 text-gray-500" />Teléfono</label>
                                <input {...register('telefono')} type="tel" placeholder="+54 11 5555-5555" className={`w-full rounded-xl border bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none ${errors.telefono ? 'border-red-500' : 'border-transparent'}`} disabled={isSubmitting} />
                                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-500" />Email</label>
                                <input {...register('email')} type="email" placeholder="paciente@correo.com" className={`w-full rounded-xl border bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none ${errors.email ? 'border-red-500' : 'border-transparent'}`} disabled={isSubmitting} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <Controller
                                name="obraSocial"
                                control={control}
                                render={({ field }) => (
                                    <InsuranceAutocomplete
                                        value={field.value ?? ''}
                                        onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Hash size={16} className="mr-2 text-gray-500" />N° de Afiliado</label>
                                <input {...register('numeroAfiliado')} type="text" placeholder="1234-5678-90" className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={isSubmitting} />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><AlertTriangle size={16} className="mr-2 text-gray-500" />Alergias</label>
                                <input {...register('alergias')} type="text" placeholder="Ninguna / Penicilina..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none" disabled={isSubmitting} />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Stethoscope size={16} className="mr-2 text-gray-500" />Antecedentes</label>
                                <textarea {...register('antecedentes')} rows={2} placeholder="Antecedentes médicos relevantes..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] text-sm px-3 py-2 resize-none focus:outline-none" disabled={isSubmitting} />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText size={16} className="mr-2 text-gray-500" />Historia Clínica (archivo)</label>
                                <div className="flex items-center">
                                    <button type="button" ref={attachBtnRef} onClick={() => fileInputRef.current?.click()} className="text-sm inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F6F5] text-black hover:bg-gray-200 select-none"><Paperclip size={16} />Adjuntar</button>
                                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileChange} onFocus={e => { try { e.target.blur(); } catch { } }} className="hidden" disabled={isSubmitting} />
                                    <span className="ml-3 text-sm text-gray-600 truncate max-w-[12rem]">{historiaClinicaFile ? historiaClinicaFile.name : 'Sin archivos seleccionados'}</span>
                                    {historiaClinicaFile && <button type="button" onClick={handleClearFile} className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"><X size={14} />Quitar</button>}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Activity size={16} className="mr-2 text-gray-500" />Estado</label>
                                <select {...register('estado')} className="text-sm w-full rounded-xl border border-transparent bg-[#F5F5F5] px-3 py-2 focus:outline-none" disabled={isSubmitting}>
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="En Tratamiento">En Tratamiento</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><FileText size={16} className="mr-2 text-gray-500" />Notas</label>
                                <textarea {...register('notas')} rows={3} placeholder="Observaciones adicionales..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] text-sm px-3 py-2 resize-none focus:outline-none" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t bg-white/80 backdrop-blur sticky bottom-0">
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
