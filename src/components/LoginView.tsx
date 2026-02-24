// src/components/LoginView.tsx
import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Calendar, Users, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

interface LoginViewProps {
    onSuccess?: () => void;
}

const Feature = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon size={16} className="text-teal-200" />
        </div>
        <div>
            <p className="font-semibold text-white text-sm">{title}</p>
            <p className="text-white/70 text-xs mt-0.5">{desc}</p>
        </div>
    </div>
);

export default function LoginView({ onSuccess }: LoginViewProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file',
                    queryParams: { access_type: 'offline', prompt: 'select_account' },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión con Google');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-[1fr_480px]">
            {/* ── Panel izquierdo: Landing / descripción de la app ── */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute bottom-10 -right-10 w-96 h-96 rounded-full bg-white/5" />

                {/* Logo + App Name */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🦷</div>
                    <div>
                        <span className="text-white font-bold text-xl">Dental Dash</span>
                        <p className="text-teal-200 text-xs">by ChillDigital Agency</p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white leading-tight">
                            El sistema de gestión<br />para tu consultorio dental
                        </h1>
                        <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-md">
                            Administrá pacientes, turnos e historias clínicas desde un solo lugar,
                            integrado con Google Calendar y WhatsApp.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <Feature icon={Users} title="Gestión de Pacientes" desc="Fichas completas, odontograma e historias clínicas digitales." />
                        <Feature icon={Calendar} title="Agenda Inteligente" desc="Sincronización automática con Google Calendar y recordatorios." />
                        <Feature icon={FileText} title="Historial Clínico" desc="Docuentación segura y accesible desde cualquier dispositivo." />
                        <Feature icon={Zap} title="Chatbot WhatsApp" desc="Responde consultas y agenda turnos vía WhatsApp automáticamente." />
                    </div>
                </div>

                {/* Footer del panel */}
                <div className="relative z-10 flex items-center gap-2 text-white/60">
                    <Shield size={14} />
                    <span className="text-xs">Datos protegidos con cifrado TLS y Row-Level Security</span>
                </div>
            </div>

            {/* ── Panel derecho: Formulario de login ── */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-sm">
                    {/* Logo mobile */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-lg">🦷</div>
                        <span className="font-bold text-gray-900 text-xl">Dental Dash</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
                            <p className="text-gray-500 text-sm mt-1">Accedé a tu consultorio digital</p>
                        </div>

                        {/* Descripción breve (visible para Google bot) */}
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                            <strong>Dental Dash</strong> es una plataforma SaaS de gestión odontológica que integra
                            agenda de turnos con Google Calendar y gestión de pacientes.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />{error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle size={16} className="shrink-0" />{success}
                            </div>
                        )}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-teal-500 transition-all shadow-sm disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.9 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.9 20-21 0-1.3-.2-2.7-.4-4z" />
                                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15 18.9 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.1 5.1 29.3 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" />
                                    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 36.5 26.8 37 24 37c-5.2 0-9.6-3-11.3-7.4L6.1 34.7C9.5 40.9 16.3 45 24 45z" />
                                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.5-4.6 5.9l6.2 5.2C40.6 35.8 44 30.4 44 24c0-1.3-.2-2.7-.4-4z" />
                                </svg>
                            )}
                            Continuar con Google
                        </button>

                        <p className="text-xs text-center text-gray-400 leading-relaxed">
                            Al continuar, aceptás los{' '}
                            <Link to="/terms" className="text-teal-600 hover:underline font-medium">Términos del Servicio</Link>
                            {' '}y la{' '}
                            <Link to="/privacy" className="text-teal-600 hover:underline font-medium">Política de Privacidad</Link>
                            {' '}de Dental Dash.
                        </p>
                    </div>

                    {/* Footer público */}
                    <div className="mt-6 text-center space-y-2">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                            <Link to="/privacy" className="hover:text-teal-600 transition-colors">Política de Privacidad</Link>
                            <span>·</span>
                            <Link to="/terms" className="hover:text-teal-600 transition-colors">Términos del Servicio</Link>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            Dental Dash © 2026 · Powered by{' '}
                            <a href="https://chilldigital.agency" target="_blank" rel="noreferrer" className="hover:text-teal-600">ChillDigital Agency</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
