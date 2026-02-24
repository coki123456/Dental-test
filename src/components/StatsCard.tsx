// src/components/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    color?: string;
}

export default function StatsCard({ title, value, color = 'text-gray-900' }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}
