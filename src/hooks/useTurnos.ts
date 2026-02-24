// src/hooks/useTurnos.ts  — Etapa 2: TanStack Query
import { useCallback } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { AppointmentService } from '../services/AppointmentService';
import type { NormalizedAppointment } from '../services/AppointmentService';

// ── Query key factory ─────────────────────────────────────────
export const turnosQueryKey = (from: string | null, to: string | null) =>
    ['turnos', from, to] as const;

// ── Date helpers ──────────────────────────────────────────────
const parseYMD = (s: string | null): Date | null => {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return new Date(s);
};

function buildDateRange(fromDate: string | null, toDate: string | null): { fromISO: string; toISO: string } {
    if (fromDate && toDate) {
        let startDate = parseYMD(fromDate) ?? new Date();
        let endDate = parseYMD(toDate) ?? new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
        return { fromISO: startDate.toISOString(), toISO: endDate.toISOString() };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    return { fromISO: today.toISOString(), toISO: nextWeek.toISOString() };
}

// ── Return type ───────────────────────────────────────────────
export interface UseTurnosReturn {
    turnos: NormalizedAppointment[];
    loading: boolean;
    error: string | null;
    refreshTurnos: (newFrom?: string | null, newTo?: string | null) => void;
    fetchTurnos: (from?: string | null, to?: string | null) => Promise<void>;
}

export function useTurnos(
    fromDate: string | null = null,
    toDate: string | null = null,
    session: Session | null = null
): UseTurnosReturn {
    const queryClient = useQueryClient();
    const qKey = turnosQueryKey(fromDate, toDate);

    // ── Fetch ──────────────────────────────────────────────────
    const query = useQuery({
        queryKey: qKey,
        queryFn: async () => {
            const { fromISO, toISO } = buildDateRange(fromDate, toDate);
            const events = await AppointmentService.getAppointments(fromISO, toISO, session);
            const list = Array.isArray(events) ? events : [];
            return list.filter(
                (ev) =>
                    (ev?.status || '').toLowerCase() !== 'cancelled' &&
                    (ev?.status || '').toLowerCase() !== 'canceled'
            );
        },
        staleTime: 2 * 60 * 1000,
        retry: 1,
    });

    // ── Invalidate / refresh helpers ──────────────────────────
    const refreshTurnos = useCallback(
        (newFrom: string | null = null, newTo: string | null = null) => {
            const key = turnosQueryKey(newFrom || fromDate, newTo || toDate);
            queryClient.invalidateQueries({ queryKey: key });
        },
        [queryClient, fromDate, toDate]
    );

    // fetchTurnos kept for backward compatibility with event listeners
    const fetchTurnos = useCallback(
        async (from: string | null = null, to: string | null = null) => {
            const key = turnosQueryKey(from || fromDate, to || toDate);
            await queryClient.invalidateQueries({ queryKey: key });
        },
        [queryClient, fromDate, toDate]
    );

    return {
        turnos: (query.data as NormalizedAppointment[]) ?? [],
        loading: query.isLoading,
        error: query.error?.message ?? null,
        refreshTurnos,
        fetchTurnos,
    };
}
