// src/config/appointments.ts
export interface AppointmentType {
    id: string;
    name: string;
    duration: number;
}

export const APPOINTMENT_TYPES: AppointmentType[] = [
    { id: 'consulta', name: 'Consulta', duration: 30 },
    { id: 'limpieza', name: 'Limpieza', duration: 45 },
    { id: 'ensenanza', name: 'Enseñanza de técnica de cepillado y flúor en niños', duration: 30 },
    { id: 'caries_chicos', name: 'Arreglos caries chicos', duration: 45 },
    { id: 'caries_grandes', name: 'Arreglos caries grandes', duration: 60 },
    { id: 'molde_blanqueamiento', name: 'Toma de molde para blanqueamiento ambulatorio', duration: 30 },
    { id: 'molde_relajacion', name: 'Toma de molde para placa de relajación', duration: 30 },
    { id: 'instalacion_placas', name: 'Instalación de placas de relajación', duration: 45 },
    { id: 'carillas', name: 'Carillas anteriores', duration: 90 },
    { id: 'contenciones', name: 'Contenciones', duration: 45 },
    { id: 'incrustaciones', name: 'Incrustaciones', duration: 75 },
];

export const WORK_DAYS: number[] = [1, 2, 3, 4, 5, 6];

export const WORK_HOURS = {
    start: 9,
    end: 18,
    interval: 30, // minutes
} as const;
