import { supabase } from '../config/supabaseClient';
import { StorageService } from './StorageService';
import type { PatientRow } from '../types/database.types';

/** Mapeo centralizado de fila DB → camelCase para la app. Exportado para reutilización en hooks. */
export function mapDbPatient(p: PatientRow | any): any {
  return {
    ...p,
    id: p.id,
    obraSocial: p.obra_social,
    numeroAfiliado: p.numero_afiliado,
    fechaNacimiento: p.fecha_nacimiento,
    historiaClinica: p.historia_clinica_url || p.historia_clinica,
    ultimaVisita: p.ultima_visita,
    estado: p.estado || 'Activo',
  };
}

// Omitted type definitions for the internal payload mapping for brevity, but we use 'Partial<Patient>' heavily
export interface PatientPayload {
  id?: string;
  _id?: string;
  nombre?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  fechaNacimiento?: string;
  alergias?: string | string[];
  antecedentes?: string;
  notas?: string;
  estado?: string;
  historiaClinicaFile?: File;
  historiaClinica?: string | null;
  historia_clinica_url?: string | null;
  createdTime?: string;
  user_id?: string;
}

/**
 * Servicio para gestionar pacientes con Supabase
 */
export interface ClinicalRecord {
  id: string;
  patient_id: string;
  user_id: string;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  odontogram_state: any;
  archivo_url?: string;
  created_at: string;
}

export class PatientService {

  /**
   * Helper centralizado para mapear filas de DB al tipo camelCase usado en la app.
   * Evita la duplicación del mapeo que existía en todos los métodos.
   */
  /** Re-usa la función libre exportada para mantener compatibilidad interna. */
  private static mapDbPatient = mapDbPatient;

  /**
   * Obtener todos los pacientes con paginación real (server-side).
   * Usa .range() en lugar de .limit(300) para soportar miles de registros.
   */
  static async fetchPatientsPaginated(
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: any[]; count: number }> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data || []).map(this.mapDbPatient),
        count: count ?? 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los pacientes (límite 300 — para compatibilidad y búsqueda textual).
   * Para listados paginados usar fetchPatientsPaginated().
   */
  static async fetchAllPatients(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) throw error;

      return (data || []).map(this.mapDbPatient);
    } catch (error) {
      throw error;

    }
  }

  /**
   * Buscar paciente dinámicamente para la vista de listado
   */
  static async searchPatients(term: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`nombre.ilike.%${term}%,dni.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        obraSocial: p.obra_social,
        numeroAfiliado: p.numero_afiliado,
        fechaNacimiento: p.fecha_nacimiento,
        historiaClinica: p.historia_clinica_url || p.historia_clinica,
        ultimaVisita: p.ultima_visita,
        estado: p.estado || 'Activo',
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Añadir un nuevo registro clínico a la historia del paciente
   */
  static async addClinicalRecord(patientId: string, record: Omit<ClinicalRecord, 'id' | 'created_at'>, userId: string): Promise<ClinicalRecord> {
    const { data, error } = await supabase
      .from('treatment_history')
      .insert([{
        patient_id: patientId,
        user_id: userId,
        ...record,
        odontogram_state: record.odontogram_state ? JSON.stringify(record.odontogram_state) : null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar paciente por ID
   */
  static async getPatientById(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        obraSocial: data.obra_social,
        numeroAfiliado: data.numero_afiliado,
        fechaNacimiento: data.fecha_nacimiento,
        historiaClinica: data.historia_clinica_url || data.historia_clinica,
        estado: data.estado || 'Activo',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar paciente por DNI — normaliza el formato (quita puntos, comas y espacios)
   */
  static async getPatientByDni(dni: string): Promise<any | null> {
    try {
      // Normalizar: quitar puntos, comas, guiones y espacios para que "12.345.678" matchee "12345678"
      const cleanDni = String(dni).replace(/[.\s,\-]/g, '').trim();

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('dni', cleanDni)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        obraSocial: data.obra_social,
        numeroAfiliado: data.numero_afiliado,
        fechaNacimiento: data.fecha_nacimiento,
        historiaClinica: data.historia_clinica_url || data.historia_clinica,
        estado: data.estado || 'Activo',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subir archivo a Storage y retornar PATH (no URL pública)
   */
  static async uploadClinicalRecord(file: File, userId: string): Promise<string> {
    try {
      if (!userId) throw new Error("Authentication session missing or expired.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clinical-records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return filePath;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo paciente
   */
  static async createPatient(patientData: PatientPayload, userId: string): Promise<any> {
    let historiaClinicaPath: string | null = null;
    try {
      if (patientData.historiaClinicaFile && userId) {
        historiaClinicaPath = await this.uploadClinicalRecord(patientData.historiaClinicaFile, userId);
      }

      const newPatient = {
        nombre: patientData.nombre,
        dni: patientData.dni,
        telefono: patientData.telefono,
        email: patientData.email,
        obra_social: patientData.obraSocial,
        numero_afiliado: patientData.numeroAfiliado,
        fecha_nacimiento: patientData.fechaNacimiento || null,
        alergias: patientData.alergias || 'Ninguna',
        antecedentes: patientData.antecedentes || 'Ninguno',
        notas: patientData.notas,
        estado: patientData.estado || 'Activo',
        historia_clinica_url: historiaClinicaPath,
        ultima_visita: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        obraSocial: data.obra_social,
        numeroAfiliado: data.numero_afiliado,
        fechaNacimiento: data.fecha_nacimiento,
        historiaClinica: data.historia_clinica_url || data.historia_clinica,
      };

    } catch (error) {
      // Rollback: Si subimos un archivo a Storage pero la DB falló, purgamos la imagen subida.
      if (historiaClinicaPath) {
        try {
          await StorageService.deleteFile(historiaClinicaPath, 'clinical-records');
        } catch (cleanupError) {
          console.error('CRITICAL: Failed to rollback file in storage', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Actualizar un paciente existente
   */
  static async updatePatient(patientData: PatientPayload, userId: string): Promise<any> {
    let newlyUploadedPath: string | null = null;
    try {
      const id = patientData.id || patientData._id;
      if (!id) throw new Error("Patient ID is required for update");

      const updates: any = {
        nombre: patientData.nombre,
        dni: patientData.dni,
        telefono: patientData.telefono,
        email: patientData.email,
        obra_social: patientData.obraSocial,
        numero_afiliado: patientData.numeroAfiliado,
        fecha_nacimiento: patientData.fechaNacimiento || null,
        alergias: patientData.alergias,
        antecedentes: patientData.antecedentes,
        notas: patientData.notas,
        estado: patientData.estado,
      };

      if (patientData.historiaClinicaFile && userId) {
        newlyUploadedPath = await this.uploadClinicalRecord(patientData.historiaClinicaFile, userId);
        updates.historia_clinica_url = newlyUploadedPath;
      } else if (patientData.historiaClinica === null || patientData.historia_clinica_url === null) {
        updates.historia_clinica_url = null;
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        obraSocial: data.obra_social,
        numeroAfiliado: data.numero_afiliado,
        fechaNacimiento: data.fecha_nacimiento,
        historiaClinica: data.historia_clinica_url || data.historia_clinica,
        estado: data.estado,
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      // Rollback: En actualizaciones también resguardamos la operación
      if (newlyUploadedPath) {
        console.warn('Rolling back newly uploaded file during update due to DB failure...');
        try {
          // The deleteFile method in StorageService expects a path, not a public URL.
          // If uploadClinicalRecord now returns a public URL, this rollback logic might need adjustment.
          await StorageService.deleteFile(newlyUploadedPath, 'clinical-records');
        } catch (cleanupError) {
          console.error('CRITICAL: Failed to rollback file in storage', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Eliminar la historia clínica de un paciente (Archivo y URL)
   */
  static async deleteClinicalRecord(patientId: string, filePath: string): Promise<boolean> {
    try {
      if (!patientId) throw new Error("ID de paciente requerido");

      // If uploadClinicalRecord now returns a public URL, filePath might be a URL.
      // StorageService.deleteFile might need to be updated to handle URLs or extract paths.
      if (filePath && !filePath.startsWith('http')) {
        await StorageService.deleteFile(filePath, 'clinical-records');
      } else if (filePath && filePath.startsWith(supabase.storage.from('clinical-records').getPublicUrl('').data.publicUrl.split('.supabase.co')[0])) {
        // Attempt to extract path from public URL if it's a Supabase URL
        const publicUrlBase = supabase.storage.from('clinical-records').getPublicUrl('').data.publicUrl;
        const pathInBucket = filePath.substring(publicUrlBase.length);
        await StorageService.deleteFile(pathInBucket, 'clinical-records');
      }


      const { error } = await supabase
        .from('patients')
        .update({ historia_clinica_url: null })
        .eq('id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting clinical record:', error);
      throw error;
    }
  }

  /**
   * Eliminar un paciente
   */
  static async deletePatient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener lista única de todas las obras sociales registradas (en perfil y en pacientes)
   */
  static async getAllUniqueInsurances(userId: string | null = null): Promise<string[]> {
    try {
      let profileInsurances: string[] = [];
      let uid = userId;

      if (!uid) {
        const { data: { session } } = await supabase.auth.getSession();
        uid = session?.user?.id || null;
      }

      if (uid) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('accepted_insurances')
          .eq('id', uid)
          .single();
        if (profile?.accepted_insurances) {
          profileInsurances = profile.accepted_insurances;
        }
      }

      const { data: patientData, error } = await supabase
        .from('patients')
        .select('obra_social');

      if (error) throw error;

      const patientInsurances = patientData
        .map(p => p.obra_social)
        .filter(val => val && val.trim() !== '');

      const combined = [...new Set([...profileInsurances, ...patientInsurances])];

      return combined.sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error('Error fetching unique insurances:', error);
      return [];
    }
  }
}
