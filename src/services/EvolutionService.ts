import { supabase } from '../config/supabaseClient';

export interface TreatmentEntry {
    id: string;
    patient_id: string;
    tooth_number?: number | null;
    procedure_type?: string;
    description?: string;
    created_at: string;
    updated_at?: string;
}

export interface NewTreatmentEntry {
    patient_id: string;
    tooth_number?: number | null;
    procedure_type?: string;
    description?: string;
}

export const EvolutionService = {
    async getHistory(patientId: string): Promise<TreatmentEntry[]> {
        const { data, error } = await supabase
            .from('treatment_history')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching treatment history:', error);
            throw error;
        }
        return data as TreatmentEntry[];
    },

    async addEntry(entry: NewTreatmentEntry): Promise<TreatmentEntry> {
        const { data, error } = await supabase
            .from('treatment_history')
            .insert([
                {
                    patient_id: entry.patient_id,
                    tooth_number: entry.tooth_number,
                    procedure_type: entry.procedure_type,
                    description: entry.description,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding treatment history entry:', error);
            throw error;
        }
        return data as TreatmentEntry;
    },

    async deleteEntry(id: string): Promise<void> {
        const { error } = await supabase.from('treatment_history').delete().eq('id', id);

        if (error) {
            console.error('Error deleting treatment history entry:', error);
            throw error;
        }
    },

    async updateEntry(
        id: string,
        updates: Pick<TreatmentEntry, 'tooth_number' | 'procedure_type' | 'description'>
    ): Promise<TreatmentEntry> {
        const { data, error } = await supabase
            .from('treatment_history')
            .update({
                tooth_number: updates.tooth_number,
                procedure_type: updates.procedure_type,
                description: updates.description,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating treatment history entry:', error);
            throw error;
        }
        return data as TreatmentEntry;
    },
};
