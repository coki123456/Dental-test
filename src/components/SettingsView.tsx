// src/components/SettingsView.tsx
import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useSettings } from './settings/useSettings';
import ProfileTab from './settings/ProfileTab';
import InsurancesTab from './settings/InsurancesTab';
import ServicesTab from './settings/ServicesTab';
import ScheduleTab from './settings/ScheduleTab';
import WhatsAppTab from './settings/WhatsAppTab';
import FaqsTab from './settings/FaqsTab';

interface SettingsViewProps { session: Session | null; }

type TabId = 'profile' | 'insurances' | 'services' | 'schedule' | 'whatsapp' | 'faqs';

const TABS: { id: TabId; label: string }[] = [
    { id: 'profile', label: 'Perfil' },
    { id: 'insurances', label: 'Obras Sociales' },
    { id: 'services', label: 'Servicios' },
    { id: 'schedule', label: 'Horarios' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'faqs', label: 'Preguntas Frecuentes' },
];

export default function SettingsView({ session }: SettingsViewProps) {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const {
        profile, tenant, schedules, faqs, loading, saving,
        googleAvatar, avatarPreview, qrCodeData, instanceStatus, pollingActive,
        setProfile, setTenant, setSchedules, setFaqs,
        handleProfileChange, handleAutoSaveProfile, handleAvatarChange,
        handleConnectWhatsApp, handleDisconnectWhatsApp,
    } = useSettings(session);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            </div>
            <div className="flex border-b mb-6 border-gray-100 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-medium text-sm whitespace-nowrap relative ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'profile' && <ProfileTab profile={profile} handleProfileChange={handleProfileChange} handleAutoSaveProfile={handleAutoSaveProfile} avatarPreview={avatarPreview} googleAvatar={googleAvatar} handleAvatarChange={handleAvatarChange} />}
                {activeTab === 'insurances' && <InsurancesTab profile={profile} handleProfileChange={handleProfileChange} handleAutoSaveProfile={handleAutoSaveProfile} />}
                {activeTab === 'services' && <ServicesTab profile={profile} handleProfileChange={handleProfileChange} handleAutoSaveProfile={handleAutoSaveProfile} />}
                {activeTab === 'schedule' && <ScheduleTab schedules={schedules} setSchedules={setSchedules} />}
                {activeTab === 'whatsapp' && <WhatsAppTab tenant={tenant} setTenant={setTenant} profile={profile} instanceStatus={instanceStatus} pollingActive={pollingActive} qrCodeData={qrCodeData} saving={saving} handleConnectWhatsApp={handleConnectWhatsApp} handleDisconnectWhatsApp={handleDisconnectWhatsApp} session={session} />}
                {activeTab === 'faqs' && <FaqsTab tenant={tenant} faqs={faqs} setFaqs={setFaqs} />}
            </div>
        </div>
    );
}
