// src/components/MessagePatientModal.tsx
import React, { useEffect, useState } from 'react';
import ModalShell from './ModalShell';
import { MessageCircle, Mail, Phone, Hash, Building2, Send, AlertCircle } from 'lucide-react';
import { initials } from '../utils/helpers';

interface MessageData {
    patient: any; channel: string; message: string;
    toPhone: string; toEmail: string; recipientName: string;
}

interface MessagePatientModalProps {
    open: boolean; patient: any; onClose: () => void; onSend?: (data: MessageData) => Promise<void>;
}

export default function MessagePatientModal({ open, patient, onClose, onSend }: MessagePatientModalProps) {
    const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) { setChannel('whatsapp'); setMessage(''); setSending(false); setError(''); }
    }, [open]);

    if (!open || !patient) return null;

    const getField = (p: any, fields: string[], def = '-') => {
        for (const f of fields) { const v = p[f] ?? p.fields?.[f]; if (v != null && v !== '') return String(v); }
        return def;
    };

    const nombre = getField(patient, ['nombre', 'name'], 'Sin nombre');
    const dni = getField(patient, ['dni', 'DNI']);
    const telefono = getField(patient, ['telefono', 'phone']);
    const email = getField(patient, ['email', 'correo']);
    const obraSocial = getField(patient, ['obraSocial', 'obra_social']);

    const handleSend = async () => {
        if (!message.trim()) { setError('El mensaje no puede estar vacío'); return; }
        if (channel === 'whatsapp' && (!telefono || telefono === '-')) { setError('Este paciente no tiene teléfono registrado'); return; }
        if (channel === 'email' && (!email || email === '-')) { setError('Este paciente no tiene email registrado'); return; }
        setSending(true); setError('');
        try {
            await onSend?.({ patient, channel, message: message.trim(), toPhone: telefono, toEmail: email, recipientName: nombre });
            setMessage(''); onClose();
        } catch (err: any) { setError(err.message || 'Error enviando el mensaje'); }
        finally { setSending(false); }
    };

    const isDisabled = !message.trim() || sending ||
        (channel === 'whatsapp' && (!telefono || telefono === '-')) ||
        (channel === 'email' && (!email || email === '-'));

    return (
        <ModalShell title="Enviar Mensaje" onClose={onClose}>
            <div className="py-4">
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-semibold mr-4">{initials(nombre)}</div>
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">{nombre}</div>
                        <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center"><Hash size={12} className="mr-1" />DNI: {dni}</div>
                            <div className="flex items-center"><Building2 size={12} className="mr-1" />{obraSocial}</div>
                        </div>
                    </div>
                </div>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm"><AlertCircle size={16} className="mr-2 shrink-0" />{error}</div>}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Canal de envío</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setChannel('whatsapp')} className={`flex items-center justify-center px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${channel === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`} disabled={sending}>
                            <MessageCircle size={16} className="mr-2" />WhatsApp
                            {(!telefono || telefono === '-') && <span className="ml-2 text-xs text-red-500">Sin teléfono</span>}
                        </button>
                        <button onClick={() => setChannel('email')} className={`flex items-center justify-center px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${channel === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`} disabled={sending}>
                            <Mail size={16} className="mr-2" />Email
                            {(!email || email === '-') && <span className="ml-2 text-xs text-red-500">Sin email</span>}
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        {channel === 'whatsapp' && <div className="flex items-center"><Phone size={14} className="mr-1" />Enviar a: {telefono || 'No disponible'}</div>}
                        {channel === 'email' && <div className="flex items-center"><Mail size={14} className="mr-1" />Enviar a: {email || 'No disponible'}</div>}
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                        placeholder={channel === 'whatsapp' ? 'Ej: Hola, te recordamos tu turno para mañana a las 15:00.' : 'Ej: Estimado paciente, le recordamos su turno programado.'}
                        disabled={sending} />
                    <div className="mt-1 text-xs text-gray-500">{message.length} caracteres</div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" disabled={sending}>Cancelar</button>
                    <button onClick={handleSend} disabled={isDisabled}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : channel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {sending ? 'Enviando...' : <><Send size={16} className="mr-2" />Enviar {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</>}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
