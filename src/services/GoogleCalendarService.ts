import { supabase } from '../config/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Module-level cache for the token (persists while the page is open)
let cachedToken: string | null = null;

export interface GoogleEventTime {
    dateTime?: string;
    date?: string;
    timeZone?: string;
}

export interface GoogleCalendarEvent {
    id?: string;
    summary?: string;
    description?: string;
    start: GoogleEventTime;
    end: GoogleEventTime;
    transparency?: string;
    attendees?: { email: string }[];
}

export interface AppointmentForCalendar {
    title?: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
    patientEmail?: string;
    [key: string]: unknown;
}

export class GoogleCalendarService {
    static getProviderToken(session?: Session | null): string | null {
        if (cachedToken) return cachedToken;
        return session?.provider_token ?? null;
    }

    static getRefreshToken(session?: Session | null): string | null {
        return session?.provider_refresh_token ?? null;
    }

    static async refreshGoogleToken(session?: Session | null): Promise<string | null> {
        try {
            const refreshToken = this.getRefreshToken(session);
            if (!refreshToken) return null;

            const { data, error } = await supabase.functions.invoke('google-token-refresh', {
                body: { refresh_token: refreshToken },
            });

            if (error) return null;

            if (data?.access_token) {
                cachedToken = data.access_token as string;
                return data.access_token as string;
            }

            return null;
        } catch {
            return null;
        }
    }

    static async fetchWithAuth(
        url: string,
        options: RequestInit = {},
        session?: Session | null
    ): Promise<Response> {
        let token = this.getProviderToken(session);
        if (!token) {
            return new Response(null, { status: 401, statusText: 'No token available' });
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
            Authorization: `Bearer ${token}`,
        };

        try {
            let response = await fetch(url, { ...options, headers });

            if (response.status === 401 && session) {
                console.warn('Google API 401. Attempting token refresh...');
                const newToken = await this.refreshGoogleToken(session);
                if (newToken) {
                    headers['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, { ...options, headers });
                }
            }

            return response;
        } catch (error) {
            console.error('FetchWithAuth Network Error:', error);
            throw error;
        }
    }

    static async listEvents(
        timeMin: Date,
        timeMax: Date,
        session?: Session | null
    ): Promise<GoogleCalendarEvent[]> {
        try {
            const params = new URLSearchParams({
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: 'true',
                orderBy: 'startTime',
            });

            const response = await this.fetchWithAuth(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
                {},
                session
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error('Google Calendar list error:', response.status, err);
                return [];
            }

            const data = await response.json();
            return (data.items || []) as GoogleCalendarEvent[];
        } catch (error) {
            console.error('Error listing Google Calendar events:', error);
            return [];
        }
    }

    static async createEvent(
        appointment: AppointmentForCalendar,
        session?: Session | null
    ): Promise<GoogleCalendarEvent | null> {
        const event = {
            summary: appointment.title,
            description: appointment.notes ?? '',
            start: {
                dateTime: appointment.start_time,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: appointment.end_time,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            attendees: appointment.patientEmail ? [{ email: appointment.patientEmail }] : [],
        };

        try {
            const response = await this.fetchWithAuth(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                { method: 'POST', body: JSON.stringify(event) },
                session
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Google Calendar API Error (Create):', errorData);
                throw new Error(
                    `Google Calendar Error: ${(errorData as any).error?.message || response.statusText}`
                );
            }

            return (await response.json()) as GoogleCalendarEvent;
        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            return null;
        }
    }

    static async updateEvent(
        googleEventId: string,
        appointment: AppointmentForCalendar,
        session?: Session | null
    ): Promise<GoogleCalendarEvent | null> {
        if (!googleEventId) return null;

        const event = {
            summary: appointment.title,
            description: appointment.notes ?? '',
            start: { dateTime: appointment.start_time },
            end: { dateTime: appointment.end_time },
            attendees: appointment.patientEmail ? [{ email: appointment.patientEmail }] : [],
        };

        try {
            const response = await this.fetchWithAuth(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
                { method: 'PUT', body: JSON.stringify(event) },
                session
            );

            if (!response.ok) throw new Error('Failed to update Google Event');
            return (await response.json()) as GoogleCalendarEvent;
        } catch (error) {
            console.error('Error updating Google Calendar event:', error);
            return null;
        }
    }

    static async deleteEvent(
        googleEventId: string,
        session?: Session | null
    ): Promise<void> {
        if (!googleEventId) return;
        try {
            await this.fetchWithAuth(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
                { method: 'DELETE' },
                session
            );
        } catch (error) {
            console.error('Error deleting Google Calendar event:', error);
        }
    }
}
