import { z } from 'zod';

export const AddPatientSchema = z.object({
    nombre: z
        .string({ error: 'El nombre es obligatorio' })
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    dni: z
        .string({ error: 'El DNI es obligatorio' })
        .min(6, 'El DNI debe tener al menos 6 caracteres')
        .max(15, 'El DNI no puede superar 15 caracteres'),
    telefono: z
        .string()
        .max(20, 'El teléfono no puede superar 20 caracteres')
        .optional()
        .or(z.literal('')),
    email: z
        .string()
        .email('El email no tiene un formato válido')
        .optional()
        .or(z.literal('')),
    obraSocial: z.string().max(100).optional().or(z.literal('')),
    numeroAfiliado: z.string().max(50).optional().or(z.literal('')),
    fechaNacimiento: z.string().optional().or(z.literal('')),
    alergias: z.string().optional().or(z.literal('')),
    antecedentes: z.string().optional().or(z.literal('')),
    notas: z.string().optional().or(z.literal('')),
    estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
});

export const UpdatePatientSchema = AddPatientSchema.extend({
    id: z.string().uuid('El ID de paciente debe ser un UUID válido').optional(),
}).partial({ dni: true });

export type AddPatientInput = z.infer<typeof AddPatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
