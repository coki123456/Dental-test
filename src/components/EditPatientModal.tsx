import React, { useEffect, useRef, useState } from 'react';
import { User, Hash, Phone, FileText, AlertTriangle, Activity, Stethoscope, AlertCircle, X, ArrowLeft, Paperclip } from 'lucide-react';
import InsuranceAutocomplete from './InsuranceAutocomplete';
import { message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePatientSchema, type UpdatePatientInput } from '../schemas/patient.schema';

interface EditPatientModalProps {
    open: boolean;
    patient: any;
    onClose: () => void;
    onSaved?: (data: any) => Promise<void>;
    onBack?: () => void;
}

export default function EditPatientModal({ open, patient, onClose, onSaved, onBack }: EditPatientModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachBtnRef = useRef<HTMLButtonElement>(null);

    const [historiaClinicaFile, setHistoriaClinicaFile] = useState<File | null>(null);
    const [shouldRemoveRecord, setShouldRemoveRecord] = useState(false);
    const [originalRecord, setOriginalRecord] = useState('');
    const [globalError, setGlobalError] = useState('');

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<UpdatePatientInput>({
        resolver: zodResolver(UpdatePatientSchema),
        defaultValues: {
            nombre: '', dni: '', telefono: '', email: '', obraSocial: '',
            numeroAfiliado: '', alergias: '', antecedentes: '', notas: '', estado: 'Activo'
        }
    });

    useEffect(() => {
        if (open && patient) {
            const getValue = (val: any) => Array.isArray(val) ? val[0] || '' : val || '';

            // Set default values for the form
            reset({
                nombre: getValue(patient?.nombre),
                dni: getValue(patient?.dni),
                telefono: getValue(patient?.telefono),
                email: getValue(patient?.email),
                obraSocial: getValue(patient?.obraSocial) || getValue(patient?.obra_social),
                numeroAfiliado: getValue(patient?.numeroAfiliado) || getValue(patient?.numero_afiliado),
                alergias: getValue(patient?.alergias || patient?.alergia),
                antecedentes: getValue(patient?.antecedentes),
                notas: getValue(patient?.notas),
                estado: getValue(patient?.estado) || 'Activo',
            });

            setHistoriaClinicaFile(null);
            setOriginalRecord(getValue(patient?.historiaClinica) || getValue(patient?.historia_clinica_url));
            setShouldRemoveRecord(false);
            setGlobalError('');
        }
    }, [open, patient, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHistoriaClinicaFile(e.target.files?.[0] || null);
        setShouldRemoveRecord(false);
        try { attachBtnRef.current?.focus({ preventScroll: true }); } catch { }
    };

    const handleClearFile = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
        setHistoriaClinicaFile(null);
        setShouldRemoveRecord(true); // Indica que queremos borrar el archivo existente
    };

    const onSubmit = async (data: UpdatePatientInput) => {
        setGlobalError('');
        try {
            const updatedPatientData: any = {
                ...patient,
                ...data,
                id: patient.id || patient._id
            };

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
            setGlobalError(msg);
            message.error(msg);
        }
    };

    if (!open || !patient) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />
            <div className="relative z-10 flex h-full items-center justify-center py-6 md:py-10 px-4">
                <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] md:max-h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur min-h-[75px]">
                            <div className="flex items-center gap-2">
                                {onBack && <button onClick={onBack} disabled={isSubmitting} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-900" type="button" aria-label="Volver"><ArrowLeft size={20} /></button>}
                                <h3 className="text-xl font-semibold text-gray-900">Editar Paciente</h3>
                            </div>
                            <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Cerrar" type="button"><X size={18} /></button>
                        </div>

                        {globalError && (
                            <div className="mb-4 mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                                <AlertCircle size={16} className="mr-2 shrink-0" />{globalError}
                            </div>
                        )}

                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-500" />Nombre *</label>
                                <input {...register('nombre')} type="text" placeholder="Nombre completo" className={`w-full rounded-xl border bg-[#F5F5F5] px-3 py-2 text-sm focus:outline-none ${errors.nombre ? 'border-red-500' : 'border-transparent'}`} disabled={isSubmitting} />
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
                                <textarea {...register('antecedentes')} rows={2} placeholder="Antecedentes médicos..." className="w-full rounded-xl border border-transparent bg-[#F5F5F5] text-sm px-3 py-2 resize-none focus:outline-none" disabled={isSubmitting} />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText size={16} className="mr-2 text-gray-500" />Historia Clínica (archivo)</label>
                                <div className="flex items-center">
                                    <button type="button" ref={attachBtnRef} onClick={() => fileInputRef.current?.click()} className="text-sm inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F6F5] text-black hover:bg-gray-200 select-none"><Paperclip size={16} />Adjuntar</button>
                                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" disabled={isSubmitting} />

                                    {(historiaClinicaFile || (originalRecord && !shouldRemoveRecord)) && (
                                        <button type="button" onClick={handleClearFile} className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full" title="Eliminar archivo"><X size={16} /></button>
                                    )}
                                    <span className="ml-3 text-sm text-gray-600 truncate max-w-[12rem]">
                                        {historiaClinicaFile ? historiaClinicaFile.name : shouldRemoveRecord ? 'Archivo eliminado' : originalRecord ? `Actual: adjunto` : 'Sin archivos'}
                                    </span>
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
                                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
