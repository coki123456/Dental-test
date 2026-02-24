import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
            <WifiOff size={18} />
            <span className="text-sm font-medium">Modo Offline Activo</span>
        </div>
    );
};

export default OfflineIndicator;
