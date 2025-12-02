'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = {
    name: 'Revenir dans myXplace',
    iconPath: '/icons/back_arrow.png',
    href: '/',
};

export default function Sidebar() {
    return (
        <div className="w-72 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-700">
            <div className="mb-10 mt-2">
                <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
            </div>

            <nav className="space-y-3">
                {aiNavItems.map((item) => {
                    const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${
                        item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'
                    }`;

                    return (
                        <Link href={item.href} key={item.name} className={classes}>
                            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <div className="pt-6">
                    <Link
                        href={backItem.href}
                        className="w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600"
                    >
                        <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
                        <span>{backItem.name}</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
