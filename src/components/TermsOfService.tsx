// src/components/TermsOfService.tsx
import React from 'react';
import { FileText, ArrowLeft, AlertTriangle, UserCheck, Globe, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">{title}</h2>
        <div className="text-gray-600 space-y-2 leading-relaxed">{children}</div>
    </section>
);

export default function TermsOfService() {
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
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center"><FileText size={28} /></div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Condiciones del Servicio</h1>
                            <p className="text-sm text-gray-400 mt-1">Última actualización: 24 de febrero de 2026</p>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        Estos Términos y Condiciones ("Términos") rigen el acceso y uso del servicio <strong>Dental Dash</strong>,
                        una plataforma de gestión odontológica operada por <strong>ChillDigital Agency</strong>
                        ("nosotros", "nuestro"). Al registrarte o utilizar el Servicio, aceptás quedar vinculado a estos Términos.
                        Si no estás de acuerdo, no debés usar el Servicio.
                    </p>

                    <Section title="1. Descripción del Servicio">
                        <p>Dental Dash es una aplicación web (SaaS) diseñada exclusivamente para <strong>profesionales de la odontología</strong> y personal autorizado de consultorios dentales. El Servicio incluye:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Gestión de pacientes, historias clínicas y odontogramas.</li>
                            <li>Sistema de turnos y agenda integrado con Google Calendar.</li>
                            <li>Comunicación con pacientes vía WhatsApp Business.</li>
                            <li>Almacenamiento de archivos clínicos.</li>
                        </ul>
                        <p>El Servicio no es una plataforma de atención médica de emergencia y no debe utilizarse como tal.</p>
                    </Section>

                    <Section title="2. Elegibilidad y Registro">
                        <p>Para usar Dental Dash debés:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Ser mayor de 18 años.</li>
                            <li>Ser un profesional de la salud dental o personal autorizado de un consultorio registrado.</li>
                            <li>Proporcionar información veraz durante el registro.</li>
                            <li>Tener una cuenta de Google válida para autenticarse.</li>
                        </ul>
                        <p>Sos responsable de mantener la confidencialidad de tu cuenta y de todas las actividades realizadas bajo la misma.</p>
                    </Section>

                    <Section title="3. Integración con Servicios de Google">
                        <p>El Servicio utiliza <strong>Google OAuth 2.0</strong> para autenticación y solicita los siguientes permisos sensibles con tu consentimiento explícito:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Permiso</th>
                                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Finalidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-xs">auth/calendar</td>
                                        <td className="px-4 py-2">Crear, modificar y eliminar eventos de turnos en tu Google Calendar.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-xs">auth/drive.file</td>
                                        <td className="px-4 py-2">Guardar historias clínicas PDF en tu Google Drive (solo archivos creados por la app).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm">Podés revocar estos permisos en cualquier momento desde <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">myaccount.google.com/permissions</a>. La revocación desactivará las funciones de sincronización del Servicio.</p>
                        <p className="text-sm">El uso de estos datos cumple con la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Política de Datos de Usuario de Google API Services</a> y los requisitos de Uso Limitado.</p>
                    </Section>

                    <Section title="4. Responsabilidad del Profesional y Datos de Pacientes">
                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">Aviso importante sobre datos clínicos</p>
                                <p>El profesional odontólogo es el único responsable, como "Responsable de Tratamiento" bajo las leyes aplicables (incluyendo la Ley 25.326 de Protección de Datos Personales de Argentina), por los datos de sus pacientes ingresados en el Servicio.</p>
                            </div>
                        </div>
                        <p>Te comprometés a:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Obtener el consentimiento informado de tus pacientes antes de ingresar sus datos en el Servicio.</li>
                            <li>No ingresar datos de pacientes sin una relación profesional legítima.</li>
                            <li>Mantener la confidencialidad de la información clínica conforme a la ética profesional y la ley.</li>
                            <li>Notificarnos ante cualquier brecha de seguridad que detectes.</li>
                        </ul>
                    </Section>

                    <Section title="5. Uso Aceptable">
                        <p>Queda prohibido:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Usar el Servicio para fines ilegales o no autorizados.</li>
                            <li>Compartir credenciales de acceso con personas no autorizadas.</li>
                            <li>Intentar acceder a datos de otros consultorios o usuarios.</li>
                            <li>Realizar ingeniería inversa, descompilar o modificar el Servicio.</li>
                            <li>Sobrecargar deliberadamente la infraestructura del Servicio.</li>
                        </ul>
                    </Section>

                    <Section title="6. Propiedad Intelectual">
                        <p>Todos los derechos de propiedad intelectual del Servicio (código, diseño, marca) son propiedad de <strong>ChillDigital Agency</strong>. Al usar el Servicio, no adquirís ningún derecho de propiedad sobre el mismo.</p>
                        <p>Los datos de tus pacientes y tu información clínica son de tu propiedad. Te otorgamos una licencia limitada para usarlos dentro del Servicio.</p>
                    </Section>

                    <Section title="7. Disponibilidad y Modificaciones">
                        <p>Nos comprometemos a mantener el Servicio disponible con un objetivo de disponibilidad del 99%. Sin embargo, no garantizamos disponibilidad ininterrumpida y podremos realizar mantenimientos programados.</p>
                        <p>Podemos modificar, suspender o discontinuar el Servicio con un aviso previo de al menos 30 días, excepto en casos de fuerza mayor.</p>
                    </Section>

                    <Section title="8. Limitación de Responsabilidad">
                        <p>El Servicio se provee "tal como está" sin garantías de ningún tipo. En la máxima medida permitida por la ley, ChillDigital Agency no será responsable por:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Pérdida de datos por uso incorrecto del Servicio.</li>
                            <li>Interrupciones del servicio causadas por terceros (Google, Supabase, proveedores de red).</li>
                            <li>Daños indirectos o consecuentes derivados del uso del Servicio.</li>
                        </ul>
                    </Section>

                    <Section title="9. Rescisión">
                        <p>Podés cancelar tu cuenta en cualquier momento. Procederemos a eliminar tus datos dentro de los 30 días posteriores a la solicitud, salvo obligación legal de conservarlos.</p>
                        <p>Podemos suspender o cancelar tu acceso sin previo aviso en caso de violación grave de estos Términos.</p>
                    </Section>

                    <Section title="10. Ley Aplicable y Jurisdicción">
                        <p>Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>. Cualquier disputa se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, con renuncia expresa a cualquier otro fuero.</p>
                    </Section>

                    <Section title="11. Contacto">
                        <p>Para consultas sobre estos Términos:</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                            <p><strong>ChillDigital Agency</strong></p>
                            <p>Correo: <a href="mailto:soporte@dentaldash.app" className="text-teal-600">soporte@dentaldash.app</a></p>
                            <p>Sitio web: <a href="https://chilldigital.agency" target="_blank" rel="noreferrer" className="text-teal-600">chilldigital.agency</a></p>
                        </div>
                    </Section>

                    <div className="flex items-center gap-3 pt-6 border-t">
                        <Scale size={16} className="text-gray-400" />
                        <p className="text-xs text-gray-400">Condiciones del Servicio de Dental Dash. Rigen a partir del 24 de febrero de 2026. Versión 1.1.</p>
                    </div>
                </div>
            </main>

            <footer className="py-8 bg-gray-50 border-t">
                <div className="text-center text-sm text-gray-400">© 2026 Dental Dash · ChillDigital Agency. Todos los derechos reservados.</div>
            </footer>
        </div>
    );
}
