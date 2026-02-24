// src/hooks/usePatients.ts  — Etapa 2: TanStack Query
import { useCallback } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { PatientService, mapDbPatient } from '../services/PatientService';
import type { NormalizedPatient } from './useNormalizedPatients';
import type { PatientPayload } from '../services/PatientService';
import type { Session } from '@supabase/supabase-js';

export const PATIENTS_QUERY_KEY = ['patients'] as const;

export interface UsePatientsReturn {
    patients: NormalizedPatient[];
    loading: boolean;
    error: string | null;
    addPatient: (data: PatientPayload) => Promise<NormalizedPatient | null>;
    updatePatient: (data: PatientPayload) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    refreshPatients: () => void;
}

export function usePatients(_session: Session | null): UsePatientsReturn {
    const queryClient = useQueryClient();

    // ── Fetch ──────────────────────────────────────────────────
    const query = useQuery({
        queryKey: PATIENTS_QUERY_KEY,
        queryFn: async () => {
            const raw = await PatientService.fetchAllPatients();
            return raw.map(mapDbPatient);
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
        mutationFn: (data: PatientPayload) => PatientService.createPatient(data),
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
        mutationFn: (data: PatientPayload) => PatientService.updatePatient(data),
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
        patients: (query.data as NormalizedPatient[]) ?? [],
        loading: query.isLoading,
        error: query.error?.message ?? null,
        addPatient,
        updatePatient,
        deletePatient,
        refreshPatients,
    };
}
