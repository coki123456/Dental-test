// src/services/OdontogramService.ts
import { supabase } from '../config/supabaseClient';

export interface OdontogramData {
    id?: string;
    patient_id: string;
    data: Record<number, Record<string, string>>;
    updated_at?: string;
}

export const OdontogramService = {
    async getOdontogram(patientId: string): Promise<OdontogramData | null> {
        if (!patientId) return null;
        try {
            const { data, error } = await supabase
                .from('odontograms')
                .select('*')
                .eq('patient_id', patientId)
                .maybeSingle();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching odontogram:', error);
            throw error;
        }
    },

    async saveOdontogram(patientId: string, odontogramData: Record<number, Record<string, string>>): Promise<OdontogramData> {
        if (!patientId) throw new Error('Patient ID is required');
        try {
            const { data, error } = await supabase
                .from('odontograms')
                .upsert({ patient_id: patientId, data: odontogramData, updated_at: new Date().toISOString() }, { onConflict: 'patient_id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving odontogram:', error);
            throw error;
        }
    },
};
