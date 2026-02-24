import { z } from 'zod';

export const AppointmentSchema = z.object({
    // Patient info
    nombre: z
        .string({ error: 'El nombre es obligatorio' })
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    dni: z
        .string({ error: 'El DNI es obligatorio' })
        .min(6, 'El DNI debe tener al menos 6 caracteres'),
    telefono: z.string().optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    obraSocial: z.string().optional().or(z.literal('')),
    numeroAfiliado: z.string().optional().or(z.literal('')),

    // Appointment info
    tipoTurnoNombre: z
        .string({ error: 'El tipo de turno es obligatorio' })
        .min(1, 'Seleccioná un tipo de turno'),
    fechaHora: z
        .string({ error: 'La fecha y hora son obligatorias' })
        .min(1, 'Seleccioná fecha y hora'),
    duracion: z
        .number({ error: 'La duración es obligatoria' })
        .min(5, 'La duración mínima es 5 minutos')
        .max(480, 'La duración máxima es 8 horas'),
    notas: z.string().max(1000, 'Las notas no pueden superar 1000 caracteres').optional().or(z.literal('')),
});

export const UpdateAppointmentSchema = AppointmentSchema.partial().extend({
    id: z.string().uuid('El ID del turno debe ser un UUID válido'),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
