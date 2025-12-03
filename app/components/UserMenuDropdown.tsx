'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface UserMenuDropdownProps {
    isOpen: boolean;
}

export default function UserMenuDropdown({ isOpen }: UserMenuDropdownProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleProfile = () => {
        router.push('/profil');
    };

    const handleSettings = () => {
        router.push('/settings');
    };

    return (
        <div
            className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl p-2 z-50"
            style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
            }}
        >
            <button
                onClick={handleProfile}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm"
            >
                Mon Profil
            </button>

            <div className="w-full mx-auto border-t border-white/30 my-1" />

            <button
                onClick={handleSettings}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm"
            >
                Paramètres
            </button>

            <div className="w-full mx-auto border-t border-white/30 my-1" />

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-600/50 text-red-400 text-sm"
            >
                Déconnexion
            </button>
        </div>
    );
}

