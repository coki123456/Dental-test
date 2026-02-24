// src/hooks/usePatients.ts  — Etapa 2: TanStack Query
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatientService, mapDbPatient } from '../services/PatientService';
import type { NormalizedPatient } from './useNormalizedPatients';
import type { PatientPayload } from '../services/PatientService';
import type { Session } from '@supabase/supabase-js';

export const PATIENTS_QUERY_KEY = ['patients'] as const;

export interface UsePatientsReturn {
    patients: NormalizedPatient[];
    totalCount: number;
    page: number;
    setPage: (p: number) => void;
    loading: boolean;
    error: string | null;
    addPatient: (data: PatientPayload) => Promise<NormalizedPatient | null>;
    updatePatient: (data: PatientPayload) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    refreshPatients: () => void;
}

export function usePatients(session: Session | null, initialPageSize = 300): UsePatientsReturn {
    const queryClient = useQueryClient();
    const userId = session?.user?.id;
    const [page, setPage] = useState(1);
    const [pageSize] = useState(initialPageSize);

    // ── Fetch con paginación ──────────────────────────────────────────────────
    const query = useQuery({
        queryKey: [...PATIENTS_QUERY_KEY, page, pageSize],
        queryFn: async () => {
            const { data, count } = await PatientService.fetchPatientsPaginated(page, pageSize);
            return { patients: data, count };
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    // ── Invalidate helper ─────────────────────────────────────
    const refreshPatients = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
    }, [queryClient]);

    // ── Add mutation ──────────────────────────────────────────
    const addMutation = useMutation({
        mutationFn: (data: PatientPayload) => {
            if (!userId) throw new Error("No hay sesión activa para crear paciente");
            return PatientService.createPatient(data, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
            window.dispatchEvent(new CustomEvent('patients:refresh'));
        },
    });

    const addPatient = useCallback(
        async (data: PatientPayload): Promise<NormalizedPatient | null> => {
            const result = await addMutation.mutateAsync(data);
            if (!result) return null;
            const raw = Array.isArray(result) ? result[0] : result;
            return mapDbPatient(raw);
        },
        [addMutation]
    );

    // ── Update mutation ───────────────────────────────────────
    const updateMutation = useMutation({
        mutationFn: (data: PatientPayload) => {
            if (!userId) throw new Error("No hay sesión activa para actualizar paciente");
            return PatientService.updatePatient(data, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
            window.dispatchEvent(new CustomEvent('patients:refresh'));
        },
    });

    const updatePatient = useCallback(
        async (data: PatientPayload): Promise<void> => {
            await updateMutation.mutateAsync(data);
        },
        [updateMutation]
    );

    // ── Delete mutation ───────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: string) => PatientService.deletePatient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
            window.dispatchEvent(new CustomEvent('patients:refresh'));
        },
    });

    const deletePatient = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    return {
        patients: (query.data?.patients as NormalizedPatient[]) ?? [],
        totalCount: query.data?.count ?? 0,
        page,
        setPage,
        loading: query.isLoading,
        error: query.error?.message ?? null,
        addPatient,
        updatePatient,
        deletePatient,
        refreshPatients,
    };
}
