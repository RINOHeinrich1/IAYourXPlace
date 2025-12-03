'use client';

import React from 'react';
import Link from 'next/link';

interface UserMenuDropdownProps {
    isOpen: boolean;
}

export default function UserMenuDropdown({ isOpen }: UserMenuDropdownProps) {
    const menuItems = [
        { href: "/profile", label: "My profil", iconSrc: "/images/iconuser.png" },
        { href: "/subscriptions", label: "Mes Abonnements", iconSrc: "/icons/Abonnements.png" },
        { href: "/logout", label: "Logout", iconSrc: "/icons/logout.png" },
    ];

    return (
        <div
            className={`
                absolute right-2 top-full mt-13
                w-54
                text-sm transition-opacity duration-200
                z-50
                ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
            style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                fontWeight: 700,
                fontStyle: "bold",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                paddingTop: "10px",
                paddingBottom: "10px",
            }}
        >
            {menuItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`
                        flex items-center  justify-between px-4 py-3
                        hover:bg-white/10 transition-colors
                        text-white text-sm
                    `}
                >
                    <div className="flex items-center space-x-4">
                        {/* Icône image à gauche */}
                        <img src={item.iconSrc} alt={item.label} className="w-5 h-5" />
                        <span>{item.label}</span>
                    </div>
                    {/* Espace réservé pour future icône à droite */}
                    <span className="w-5 h-5"></span>
                </Link>
            ))}
        </div>
    );
}
