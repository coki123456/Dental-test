// src/components/PrivacyPolicy.tsx
import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, Trash2, UserCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">{title}</h2>
        <div className="text-gray-600 space-y-2 leading-relaxed">{children}</div>
    </section>
);

const InfoBox = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="flex gap-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
        <div className="mt-0.5 shrink-0 text-teal-600"><Icon size={20} /></div>
        <div>
            <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
            <p className="text-sm text-gray-600">{children}</p>
        </div>
    </div>
);

export default function PrivacyPolicy() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors">
                        <ArrowLeft size={20} /><span className="font-medium">Volver</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">🦷</div>
                        <span className="font-bold text-gray-900">Dental Dash</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
                    <div className="flex items-center gap-4 mb-2 text-teal-600">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center"><Shield size={28} /></div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Política de Privacidad</h1>
                            <p className="text-sm text-gray-400 mt-1">Última actualización: 24 de febrero de 2026</p>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        Esta Política de Privacidad describe cómo <strong>Dental Dash</strong>, desarrollado por <strong>ChillDigital Agency</strong>,
                        recopila, usa, almacena y protege la información cuando utilizas nuestra plataforma de gestión odontológica
                        en <strong>dentaldash.app</strong> (el "Servicio"). Al utilizar el Servicio, aceptas las prácticas descritas en este documento.
                    </p>

                    <Section title="1. Información que Recopilamos">
                        <p><strong>a) Información de cuenta Google:</strong> Cuando iniciás sesión con Google OAuth 2.0, obtenemos tu nombre, dirección de correo electrónico y foto de perfil únicamente para identificar tu cuenta. Nunca accedemos a tu contraseña de Google.</p>
                        <p><strong>b) Google Calendar (Sensitive Scope):</strong> Con tu consentimiento explícito, el Servicio solicita acceso a <code className="bg-gray-100 px-1 rounded text-xs">https://www.googleapis.com/auth/calendar</code>. Este permiso se usa <em>exclusivamente</em> para:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Crear eventos en tu calendario personal cuando agendás un turno odontológico.</li>
                            <li>Actualizar o eliminar dichos eventos si el turno es modificado o cancelado.</li>
                            <li>Leer eventos existentes para evitar superposición de horarios al sugerir turnos disponibles.</li>
                        </ul>
                        <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                            <strong>Importante:</strong> El uso de los datos de Google Calendar está limitado estrictamente a las funciones de gestión de turnos. No compartimos, vendemos ni utilizamos estos datos para publicidad ni ningún otro fin.
                        </p>
                        <p><strong>c) Google Drive (Sensitive Scope):</strong> El Servicio solicita <code className="bg-gray-100 px-1 rounded text-xs">https://www.googleapis.com/auth/drive.file</code> para guardar historias clínicas digitales en tu propio Google Drive. Solo accedemos a los archivos que la propia aplicación crea; nunca a otros archivos de tu Drive.</p>
                        <p><strong>d) Datos de Pacientes:</strong> La información que ingresás sobre tus pacientes (nombre, DNI, obra social, antecedentes, etc.) se almacena en nuestra base de datos segura (Supabase) y es accesible exclusivamente por vos. No compartimos esta información con terceros.</p>
                    </Section>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InfoBox icon={Lock} title="Acceso limitado">
                            Solo accedemos a los datos de Google estrictamente necesarios para las funciones del Servicio que vos activás.
                        </InfoBox>
                        <InfoBox icon={Eye} title="Sin publicidad">
                            No usamos tus datos de Google para mostrarte publicidad personalizada ni los compartimos con redes publicitarias.
                        </InfoBox>
                        <InfoBox icon={Database} title="Almacenamiento seguro">
                            Todos los datos se almacenan cifrados en tránsito (TLS 1.2+) y en reposo mediante Supabase (infraestructura AWS).
                        </InfoBox>
                        <InfoBox icon={Trash2} title="Eliminación de datos">
                            Podés solicitar la eliminación de tus datos en cualquier momento escribiéndonos a <span className="font-mono text-xs">soporte@dentaldash.app</span>
                        </InfoBox>
                    </div>

                    <Section title="2. Uso de los Datos de Google APIs">
                        <p>El uso de los datos obtenidos mediante las APIs de Google se adhiere a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Política de Datos de Usuario de los Servicios de API de Google</a>, incluyendo los requisitos de Uso Limitado.</p>
                        <p>Específicamente, los datos de Google Calendar y Google Drive:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Se usan solo para proveer las funciones visibles del Servicio al usuario que otorgó el acceso.</li>
                            <li>No son transferidos a terceros salvo que sea necesario para proveer el Servicio (e.g., Supabase como backend de almacenamiento).</li>
                            <li>No se usan para desarrollar, mejorar o entrenar modelos de IA/ML generalizados.</li>
                            <li>No se transfieren a otros servicios sin el consentimiento explícito del usuario.</li>
                        </ul>
                    </Section>

                    <Section title="3. Compartir Información con Terceros">
                        <p>No vendemos ni alquilamos tu información personal. Podemos compartir datos únicamente con:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li><strong>Supabase Inc.:</strong> Proveedor de base de datos y autenticación. <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Ver su política de privacidad.</a></li>
                            <li><strong>Google LLC:</strong> Para autenticación OAuth y sincronización de calendario según los permisos que otorgaste.</li>
                            <li><strong>Autoridades legales:</strong> Solo si estamos obligados por ley.</li>
                        </ul>
                    </Section>

                    <Section title="4. Retención y Eliminación de Datos">
                        <p>Conservamos tus datos mientras tengas una cuenta activa. Los tokens de acceso de Google tienen una duración limitada (1 hora) y se renuevan automáticamente con tu token de actualización mientras el Servicio esté activo.</p>
                        <p>Podés revocar el acceso de Dental Dash a tu cuenta Google en cualquier momento desde: <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">myaccount.google.com/permissions</a>.</p>
                    </Section>

                    <Section title="5. Seguridad">
                        <p>Implementamos medidas técnicas estándar de la industria: cifrado TLS/SSL en tránsito, Row-Level Security (RLS) en la base de datos para aislar los datos de cada consultorio, y rotación automática de tokens de acceso.</p>
                    </Section>

                    <Section title="6. Tus Derechos">
                        <p>Tenés derecho a acceder, rectificar o eliminar tus datos personales. Para ejercer estos derechos, contactanos en <strong>soporte@dentaldash.app</strong>. Los usuarios en Argentina están protegidos por la Ley 25.326 de Protección de Datos Personales.</p>
                    </Section>

                    <Section title="7. Cambios a esta Política">
                        <p>Podemos actualizar esta Política periódicamente. Te notificaremos por correo electrónico ante cambios materiales. El uso continuado del Servicio implica la aceptación de la versión vigente.</p>
                    </Section>

                    <Section title="8. Contacto">
                        <p>Si tenés preguntas sobre esta Política, contactá al responsable del tratamiento:</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                            <p><strong>ChillDigital Agency</strong></p>
                            <p>Correo: <a href="mailto:soporte@dentaldash.app" className="text-teal-600">soporte@dentaldash.app</a></p>
                            <p>Sitio web: <a href="https://chilldigital.agency" target="_blank" rel="noreferrer" className="text-teal-600">chilldigital.agency</a></p>
                        </div>
                    </Section>

                    <div className="flex items-center gap-3 pt-6 border-t">
                        <Globe size={16} className="text-gray-400" />
                        <p className="text-xs text-gray-400">Esta política aplica exclusivamente al Servicio "Dental Dash" operado por ChillDigital Agency. Última actualización: 24 de febrero de 2026.</p>
                    </div>
                </div>
            </main>

            <footer className="py-8 bg-gray-50 border-t">
                <div className="text-center text-sm text-gray-400">© 2026 Dental Dash · ChillDigital Agency. Todos los derechos reservados.</div>
            </footer>
        </div>
    );
}
