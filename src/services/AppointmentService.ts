import { supabase } from '../config/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { WORK_HOURS } from '../config/appointments';
import { GoogleCalendarService } from './GoogleCalendarService';

export interface AppointmentRow {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    notes?: string;
    patient_id: string;
    appointment_type?: string;
    google_event_id?: string | null;
    google_sync_status?: string | null;
    duration?: number;
    patient?: {
        nombre?: string;
        dni?: string;
        telefono?: string;
        email?: string;
        obra_social?: string;
        numero_afiliado?: string;
    };
}

export interface NormalizedAppointment {
    id: string;
    title: string;
    start: string;
    end: string;
    status: string;
    notes?: string;
    patientId: string;
    patientName?: string;
    patientDni?: string;
    patientPhone?: string;
    tipoTurnoNombre?: string;
    tipoTurno?: string;
}

export interface CreateAppointmentData {
    dni: string;
    nombre: string;
    telefono: string;
    email?: string;
    obraSocial?: string;
    numeroAfiliado?: string;
    alergias?: string;
    antecedentes?: string;
    tipoTurnoNombre: string;
    fechaHora: string;
    duracion: number;
    notas?: string;
}

export class AppointmentService {
    /**
     * Obtener turnos en un rango de fechas
     */
    static async getAppointments(
        from: string,
        to: string,
        _session: Session | null = null
    ): Promise<NormalizedAppointment[]> {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:patients (
            nombre,
            dni,
            telefono,
            email
          )
        `)
                .gte('start_time', from)
                .lte('end_time', to);

            if (error) throw error;
            return (data as AppointmentRow[]).map((app) => ({
                id: app.id,
                title: app.title,
                start: app.start_time,
                end: app.end_time,
                status: app.status,
                notes: app.notes,
                patientId: app.patient_id,
                patientName: app.patient?.nombre,
                patientDni: app.patient?.dni,
                patientPhone: app.patient?.telefono,
                tipoTurnoNombre: app.appointment_type,
                tipoTurno: app.appointment_type,
            }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calcular horarios disponibles para una fecha y duración
     */
    static async getAvailableSlots(
        date: string,
        durationMinutes: number,
        excludeId: string | null = null
    ): Promise<string[]> {
        try {
            const [yStr, mStr, dStr] = String(date).split('-');
            const inputDate = new Date(
                parseInt(yStr, 10),
                parseInt(mStr, 10) - 1,
                parseInt(dStr, 10),
                12,
                0,
                0
            );

            const dayOfWeek = inputDate.getDay();

            const { data: daySchedules, error: schedError } = await supabase
                .from('schedules')
                .select('*')
                .eq('day_of_week', dayOfWeek)
                .eq('is_active', true);

            if (schedError) throw schedError;
            if (!daySchedules || daySchedules.length === 0) return [];

            const dayStartBound = new Date(inputDate);
            dayStartBound.setHours(0, 0, 0, 0);
            const dayEndBound = new Date(inputDate);
            dayEndBound.setHours(23, 59, 59, 999);

            const { data: existing, error } = await supabase
                .from('appointments')
                .select('id, start_time, end_time')
                .gte('start_time', dayStartBound.toISOString())
                .lte('start_time', dayEndBound.toISOString())
                .neq('status', 'cancelled');

            if (error) throw error;

            const googleEvents = await GoogleCalendarService.listEvents(dayStartBound, dayEndBound);

            const nowTime = new Date();
            const minTimeForAppt = new Date(nowTime.getTime() + 30 * 60000);

            const slots: string[] = [];

            for (const schedule of daySchedules) {
                const [startHour, startMinute] = schedule.start_time.split(':');
                const [endHour, endMinute] = schedule.end_time.split(':');

                const rangeStart = new Date(inputDate);
                rangeStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
                const rangeEnd = new Date(inputDate);
                rangeEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

                let current = new Date(rangeStart);

                while (current < rangeEnd) {
                    const slotStart = new Date(current);
                    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

                    if (slotEnd > rangeEnd) break;
                    if (slotStart < minTimeForAppt) {
                        current.setMinutes(current.getMinutes() + WORK_HOURS.interval);
                        continue;
                    }

                    const isOccupiedLocal = (existing || []).some((app: any) => {
                        if (excludeId && app.id === excludeId) return false;
                        const appStart = new Date(app.start_time);
                        const appEnd = new Date(app.end_time);
                        return slotStart < appEnd && slotEnd > appStart;
                    });

                    const isOccupiedGoogle = (googleEvents || []).some((event: any) => {
                        if (event.transparency === 'transparent') return false;
                        let eventStart: Date, eventEnd: Date;
                        if (event.start?.date) {
                            const [sY, sM, sD] = event.start.date.split('-').map(Number);
                            eventStart = new Date(sY, sM - 1, sD, 0, 0, 0);
                            const [eY, eM, eD] = event.end.date.split('-').map(Number);
                            eventEnd = new Date(eY, eM - 1, eD, 0, 0, 0);
                        } else {
                            eventStart = new Date(event.start?.dateTime);
                            eventEnd = new Date(event.end?.dateTime);
                        }
                        return slotStart < eventEnd && slotEnd > eventStart;
                    });

                    if (!isOccupiedLocal && !isOccupiedGoogle) {
                        slots.push(
                            slotStart.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })
                        );
                    }

                    current.setMinutes(current.getMinutes() + WORK_HOURS.interval);
                }
            }

            return Array.from(new Set(slots)).sort();
        } catch (error) {
            console.error('Error getting available slots:', error);
            return [];
        }
    }

    /**
     * Obtener los servicios configurados en el perfil del usuario
     */
    static async getServices(session: Session | null = null): Promise<string[]> {
        try {
            let userId = session?.user?.id;
            if (!userId) {
                const { data } = await supabase.auth.getSession();
                userId = data?.session?.user?.id;
            }
            if (!userId) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select('services')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data?.services || [];
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }

    /**
     * Obtener los días laborales activos desde la configuración
     */
    static async getActiveWorkingDays(): Promise<number[]> {
        try {
            const { data, error } = await supabase
                .from('schedules')
                .select('day_of_week')
                .eq('is_active', true);

            if (error) throw error;
            const days = [...new Set<number>((data || []).map((item: any) => item.day_of_week))].sort(
                (a, b) => a - b
            );
            return days;
        } catch (error) {
            console.error('Error fetching working days:', error);
            return [1, 2, 3, 4, 5];
        }
    }

    /**
     * Helper para formatear descripción del evento
     */
    static formatEventDescription(data: Partial<CreateAppointmentData> & { nombre?: string }): string {
        return `
Paciente: ${data.nombre ?? ''}
DNI: ${data.dni ?? ''}
Teléfono: ${data.telefono ?? ''}
Email: ${data.email ?? 'No informado'}
Obra Social: ${data.obraSocial ?? 'No informada'}
Nro Afiliado: ${data.numeroAfiliado ?? '-'}

Tipo de Turno: ${data.tipoTurnoNombre ?? ''}
Duración: ${data.duracion ?? 0} min

Notas:
${data.notas ?? 'Sin notas adicionales'}
    `.trim();
    }

    /**
     * Crear un turno
     */
    static async createAppointment(data: CreateAppointmentData): Promise<AppointmentRow> {
        try {
            const cleanDni = data.dni?.trim();

            const { data: existingPatient } = await supabase
                .from('patients')
                .select('id, email')
                .eq('dni', cleanDni)
                .maybeSingle();

            let patientId: string;

            if (existingPatient) {
                patientId = existingPatient.id;
            } else {
                const { data: newPatient, error: createError } = await supabase
                    .from('patients')
                    .insert([
                        {
                            dni: cleanDni,
                            nombre: data.nombre?.trim(),
                            telefono: data.telefono?.trim(),
                            email: data.email?.trim(),
                            obra_social: data.obraSocial?.trim(),
                            numero_afiliado: data.numeroAfiliado?.trim(),
                            alergias: data.alergias,
                            antecedentes: data.antecedentes,
                        },
                    ])
                    .select()
                    .single();

                if (createError) throw createError;
                patientId = newPatient.id;
            }

            const startTime = new Date(data.fechaHora);
            const endTime = new Date(startTime.getTime() + (data.duracion || 30) * 60000);

            const appointment = {
                title: `${data.tipoTurnoNombre} - ${data.nombre}`,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration: data.duracion,
                appointment_type: data.tipoTurnoNombre,
                patient_id: patientId,
                notes: data.notas,
                status: 'confirmed',
            };

            const { data: result, error } = await supabase
                .from('appointments')
                .insert([appointment])
                .select()
                .single();

            if (error) throw error;

            try {
                const patientEmail = existingPatient ? existingPatient.email : data.email;
                const description = this.formatEventDescription(data);
                const googleEvent = await GoogleCalendarService.createEvent({
                    ...result,
                    title: appointment.title,
                    patientEmail,
                    notes: description,
                });

                if (googleEvent?.id) {
                    await supabase
                        .from('appointments')
                        .update({ google_event_id: googleEvent.id })
                        .eq('id', result.id);
                }
            } catch (syncError) {
                console.error('Google Sync Error:', syncError);
            }

            return result;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    /**
     * Actualizar turno
     */
    static async updateAppointment(
        id: string,
        data: Partial<CreateAppointmentData>
    ): Promise<AppointmentRow> {
        try {
            const startTime = new Date(data.fechaHora!);
            const endTime = new Date(startTime.getTime() + (data.duracion || 30) * 60000);

            const updates = {
                title: `${data.tipoTurnoNombre} - ${data.nombre}`,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration: data.duracion,
                appointment_type: data.tipoTurnoNombre,
                notes: data.notas,
            };

            const { data: result, error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            try {
                if (result.google_event_id) {
                    const description = this.formatEventDescription(data);
                    await GoogleCalendarService.updateEvent(result.google_event_id, {
                        ...updates,
                        patientEmail: data.email,
                        notes: description,
                    });
                }
            } catch (syncError) {
                console.error('Google Sync Error (Update):', syncError);
            }

            return result;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    /**
     * Sincronizar turnos pendientes con Google Calendar
     */
    static async syncPendingAppointments(_session: Session | null = null): Promise<void> {
        try {
            const today = new Date().toISOString();

            const { data: pending, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:patients (
            nombre, dni, telefono, email, obra_social, numero_afiliado
          )
        `)
                .eq('status', 'confirmed')
                .is('google_event_id', null)
                .gte('start_time', today);

            if (error) throw error;
            if (!pending || pending.length === 0) return;

            console.log(`Sincronizando ${pending.length} turnos pendientes...`);

            for (const appt of pending) {
                try {
                    const googleEvent = await GoogleCalendarService.createEvent({
                        title: `${appt.title} - ${appt.patient?.nombre || 'Paciente'}`,
                        start_time: appt.start_time,
                        end_time: appt.end_time,
                        notes: appt.notes,
                    });

                    if (googleEvent?.id) {
                        await supabase
                            .from('appointments')
                            .update({ google_event_id: googleEvent.id, google_sync_status: 'synced' })
                            .eq('id', appt.id);
                    }
                } catch (e) {
                    console.error(`Error sincronizando turno ${appt.id}:`, e);
                }
            }
        } catch (error) {
            console.error('Error in syncPendingAppointments:', error);
        }
    }

    /**
     * Eliminar (cancelar) turno
     */
    static async deleteAppointment(id: string): Promise<boolean> {
        try {
            const { data: appointment } = await supabase
                .from('appointments')
                .select('google_event_id')
                .eq('id', id)
                .single();

            const { error } = await supabase.from('appointments').delete().eq('id', id);
            if (error) throw error;

            if (appointment?.google_event_id) {
                try {
                    await GoogleCalendarService.deleteEvent(appointment.google_event_id);
                } catch (syncError) {
                    console.error('Google Sync Error (Delete):', syncError);
                }
            }

            return true;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
}
