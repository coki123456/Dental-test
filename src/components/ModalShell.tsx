// src/components/ModalShell.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

export default function ModalShell({ title, onClose, children, footer, maxWidth = 'max-w-md' }: ModalShellProps) {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 flex h-full items-center justify-center py-6 md:py-10 px-4">
                <div className={`relative bg-white w-full ${maxWidth} rounded-2xl shadow-xl border flex flex-col max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-5rem)] min-h-0 overflow-hidden`}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{title}</h3>
                        <button onClick={onClose} type="button" className="relative z-20 p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Cerrar">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 [scrollbar-gutter:stable]">
                        {children}
                    </div>
                    {footer && <div className="px-6 py-4 border-t bg-white">{footer}</div>}
                </div>
            </div>
        </div>
    );
}
