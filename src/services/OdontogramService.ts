import { supabase } from '../config/supabaseClient';

export interface OdontogramData {
    [toothId: string]: {
        status?: string;
        color?: string;
        note?: string;
        [key: string]: unknown;
    };
}

export interface OdontogramRecord {
    id: string;
    patient_id: string;
    data: OdontogramData;
    updated_at: string;
    created_at: string;
}

export const OdontogramService = {
    /**
     * Obtiene el odontograma de un paciente
     */
    async getOdontogram(patientId: string): Promise<OdontogramRecord | null> {
        if (!patientId) return null;
        try {
            const { data, error } = await supabase
                .from('odontograms')
                .select('*')
                .eq('patient_id', patientId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return data as OdontogramRecord | null;
        } catch (error) {
            console.error('Error fetching odontogram:', error);
            throw error;
        }
    },

    /**
     * Guarda o actualiza el odontograma de un paciente
     */
    async saveOdontogram(patientId: string, odontogramData: OdontogramData): Promise<OdontogramRecord> {
        if (!patientId) throw new Error('Patient ID is required');
        try {
            const { data, error } = await supabase
                .from('odontograms')
                .upsert(
                    {
                        patient_id: patientId,
                        data: odontogramData,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'patient_id' }
                )
                .select()
                .single();

            if (error) throw error;
            return data as OdontogramRecord;
        } catch (error) {
            console.error('Error saving odontogram:', error);
            throw error;
        }
    },
};
