// src/components/ClinicalRecordModal.tsx
import React, { useEffect, useState } from 'react';
import { FolderOpen, Upload, X, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import ModalShell from './ModalShell';
import type { Session } from '@supabase/supabase-js';

interface ClinicalRecordModalProps {
    open: boolean;
    patient: any;
    onClose: () => void;
    session: Session | null;
}

function isPdf(url = '') {
    if (typeof url !== 'string') return false;
    return url.toLowerCase().includes('.pdf');
}

export default function ClinicalRecordModal({ open, patient, onClose, session }: ClinicalRecordModalProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [localRawUrl, setLocalRawUrl] = useState<string | null>(null);

    useEffect(() => {
        if (patient) {
            setLocalRawUrl(
                patient.historiaUrl || patient.odontogramaUrl || patient.odontograma ||
                patient.historiaClinica || patient.historiaClinicaUrl || patient.historia_clinica_url || ''
            );
        }
    }, [patient, open]);

    useEffect(() => {
        let active = true;
        async function fetchUrl() {
            if (!localRawUrl) { if (active) setSignedUrl(null); return; }
            const isPublicUrl = localRawUrl.startsWith('http://') || localRawUrl.startsWith('https://');
            if (isPublicUrl) { if (active) setSignedUrl(localRawUrl); return; }
            const isLikelyPath = typeof localRawUrl === 'string' && localRawUrl.length > 5 && !localRawUrl.includes(' ') && !['Sin archivo', 'Sin historia clínica', '-'].includes(localRawUrl);
            if (!isLikelyPath) { if (active) setSignedUrl(null); return; }
            try {
                if (active) setLoading(true);
                const url = await StorageService.getSignedUrl(localRawUrl);
                if (active) setSignedUrl(url);
            } catch { console.error('Error fetching signed URL'); }
            finally { if (active) setLoading(false); }
        }
        if (open) { setSignedUrl(null); fetchUrl(); } else { setSignedUrl(null); }
        return () => { active = false; };
    }, [localRawUrl, open]);

    if (!open || !patient) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const { PatientService } = await import('../services/PatientService');
            const userId = session?.user?.id;
            if (!userId) throw new Error('No hay sesión activa');
            const newPath = await PatientService.uploadClinicalRecord(file, userId);
            if (localRawUrl && !localRawUrl.startsWith('http')) {
                try { await StorageService.deleteFile(localRawUrl, 'clinical-records'); } catch { /* ignore */ }
            }
            const { supabase } = await import('../config/supabaseClient');
            await supabase.from('patients').update({ historia_clinica_url: newPath }).eq('id', patient.id);
            setLocalRawUrl(newPath);
            window.dispatchEvent(new CustomEvent('patients:refresh'));
            e.target.value = '';
        } catch (err: any) { alert('Error al cambiar el archivo: ' + err.message); }
        finally { setLoading(false); }
    };

    const displayUrl = signedUrl;

    return (
        <ModalShell
            title="Historia Clínica"
            onClose={onClose}
            maxWidth="max-w-2xl"
            footer={
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button onClick={() => displayUrl && window.open(displayUrl, '_blank')} disabled={!displayUrl || loading} className="flex-1 h-12 flex items-center justify-center gap-2 px-4 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FolderOpen size={18} /><span>Abrir</span>
                    </button>
                    <label className="flex-1 h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 cursor-pointer">
                        <Upload size={18} /><span>{localRawUrl ? 'Modificar' : 'Adjuntar Nuevo'}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                    </label>
                    <button onClick={onClose} className="flex-1 h-12 flex items-center justify-center gap-2 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">
                        <X size={18} /><span>Cerrar</span>
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-6">
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl border border-dashed border-gray-300 overflow-hidden flex items-center justify-center relative group">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
                            <span className="text-sm text-gray-500 font-medium">Cargando documento...</span>
                        </div>
                    ) : !localRawUrl ? (
                        <div className="flex flex-col items-center gap-4 text-gray-400"><ImageIcon size={64} strokeWidth={1} /><span className="text-sm font-medium">No hay archivo seleccionado</span></div>
                    ) : !displayUrl ? (
                        <div className="flex flex-col items-center gap-3 text-amber-500"><AlertTriangle size={48} /><span className="text-sm font-bold uppercase tracking-wider text-center px-4">Error cargando archivo</span></div>
                    ) : isPdf(displayUrl) || (typeof localRawUrl === 'string' && localRawUrl.includes('drive.google.com')) ? (
                        <div className="w-full h-full"><iframe title="Historia Clínica" src={displayUrl} className="w-full h-full border-none" /></div>
                    ) : (
                        <a href={displayUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center cursor-zoom-in">
                            <img src={displayUrl} alt="Historia Clínica" className="w-full h-full object-contain" />
                        </a>
                    )}
                </div>
                {!localRawUrl && <p className="text-center text-sm text-gray-500 italic">Sube un archivo (Imagen o PDF) para verlo aquí.</p>}
            </div>
        </ModalShell>
    );
}
