// src/components/settings/ScheduleTab.tsx
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import { message } from 'antd';

interface ScheduleTabProps {
    schedules: any[];
    setSchedules: React.Dispatch<React.SetStateAction<any[]>>;
}

const DAYS = [
    { id: 0, name: 'Domingo' }, { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' }, { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' },
];

export default function ScheduleTab({ schedules, setSchedules }: ScheduleTabProps) {
    const handleUpdate = async (slotId: string, updates: Record<string, any>) => {
        try {
            const { error } = await supabase.from('schedules').update(updates).eq('id', slotId);
            if (error) throw error;
            setSchedules(prev => prev.map(sc => sc.id === slotId ? { ...sc, ...updates } : sc));
            message.success('Horario actualizado');
        } catch (err: any) { message.error('Error al actualizar horario: ' + err.message); }
    };

    const handleAdd = async (dayId: number) => {
        try {
            const existingSlots = schedules.filter(s => s.day_of_week === dayId);
            const defaultStart = existingSlots.length > 0 ? '16:00:00' : '09:00:00';
            const defaultEnd = existingSlots.length > 0 ? '20:00:00' : '18:00:00';
            const { data, error } = await supabase.from('schedules').insert({ day_of_week: dayId, start_time: defaultStart, end_time: defaultEnd, is_active: true }).select().single();
            if (error) throw error;
            setSchedules(prev => [...prev, data]);
            message.success('Horario agregado');
        } catch (err: any) { message.error('Error al agregar: ' + err.message); }
    };

    const handleDelete = async (slotId: string) => {
        try {
            const { error } = await supabase.from('schedules').delete().eq('id', slotId);
            if (error) throw error;
            setSchedules(prev => prev.filter(sc => sc.id !== slotId));
            message.success('Horario eliminado');
        } catch (err: any) { message.error('Error al eliminar: ' + err.message); }
    };

    return (
        <div className="divide-y divide-gray-50">
            {DAYS.map(day => {
                const daySlots = schedules.filter(s => s.day_of_week === day.id);
                return (
                    <div key={day.id} className="p-6 flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-32 font-bold text-gray-900 pt-2">{day.name}</div>
                        <div className="flex-1 space-y-3">
                            {daySlots.length === 0 ? <div className="text-sm text-gray-400 italic">No laborable</div> : daySlots.map((slot, index) => (
                                <div key={slot.id} className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Bloque {index + 1}</span>
                                        <div className="flex items-center gap-2">
                                            <input type="time" value={slot.start_time.slice(0, 5)} onChange={e => handleUpdate(slot.id, { start_time: e.target.value })} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                                            <span className="text-gray-300">-</span>
                                            <input type="time" value={slot.end_time.slice(0, 5)} onChange={e => handleUpdate(slot.id, { end_time: e.target.value })} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                                            <Trash2 size={16} className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleDelete(slot.id)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => handleAdd(day.id)} className="text-sm text-teal-600 font-bold flex items-center gap-1 hover:text-teal-700 mt-2 pl-1">
                                <Plus size={16} /> Agregar bloque horario
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
