// src/components/Chip.tsx
import React from 'react';
import { cls } from '../utils/helpers';

interface ChipProps {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function Chip({ active, children, onClick }: ChipProps) {
    return (
        <button
            onClick={onClick}
            className={cls(
                'px-3 py-1 rounded-full text-sm border',
                active ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            )}
        >
            {children}
        </button>
    );
}
