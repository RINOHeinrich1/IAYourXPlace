'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- Composant Sidebar (inchangé) ---
const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: true, iconPath: '/images/crer.png', href: '/creer-modele' }, // Active pour cette page
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = {
    name: 'Revenir dans myXplace',
    iconPath: '/icons/back_arrow.png',
    href: '/',
};

const Sidebar = () => (
    <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50">
        <div className="mb-10 mt-2">
            <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
        </div>

        <nav className="space-y-3">
            {aiNavItems.map((item) => (
                <Link key={item.name} href={item.href} className={`flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'}`}>
                    <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                    <span>{item.name}</span>
                </Link>
            ))}

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
// --- Fin Sidebar ---

interface ChoiceCardProps {
    label: string;
    imagePath: string;
    onClick: () => void;
    showCheck?: boolean;
}
const ChoiceCard: React.FC<ChoiceCardProps> = ({ label, imagePath, onClick, showCheck }) => (
    <div
        onClick={onClick}
        className="relative w-36 h-56 rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 transform hover:scale-105"
    >
        <Image src={imagePath} alt={label} layout="fill" objectFit="cover" className="absolute z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-3 text-center">
            <span className="text-white text-lg font-bold z-10">{label}</span>
        </div>

        {/* Affiche l'icône vrai seulement si showCheck = true */}
        {showCheck && (
            <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        )}
    </div>
);

export default function TypeCheveuxPage() {
    const [selectedType, setSelectedType] = useState<string>('Lisse');
    const [selectedColor, setSelectedColor] = useState<string>('Brune');

    const hairTypes = [
        { label: 'Lisse', imagePath: '/images/G.jpg' },
        { label: 'Frange', imagePath: '/images/G.jpg' },
        { label: 'Bouclé', imagePath: '/images/G.jpg' },
        { label: 'Court', imagePath: '/images/G.jpg' },
        { label: 'Chignon', imagePath: '/images/G.jpg' },
    ];

    const hairColors = [
        { label: 'Brune', imagePath: '/images/H.jpg' },
        { label: 'Blonde', imagePath: '/images/H.jpg' },
        { label: 'Noir', imagePath: '/images/H.jpg' },
        { label: 'Rousse', imagePath: '/images/H.jpg' },
        { label: 'Rose', imagePath: '/images/H.jpg' },
    ];

    // Note: Les chemins d'images ci-dessus sont des placeholders.
    // Vous devez créer ces images dans votre dossier public/images.

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">

                {/* En-tête (Vide dans le design, mais on garde l'icône utilisateur) */}
                <div className="flex justify-end items-center mb-10">
                    <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </div>
                </div>

                {/* Section Type de Cheveux */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">
                    Type de cheveux
                </h2>

                <div className="flex justify-center gap-4 mb-20">
                    {hairTypes.map((type) => (
                        <ChoiceCard
                            key={type.label}
                            label={type.label}
                            imagePath={type.imagePath}
                            showCheck={selectedType === type.label}
                            onClick={() => setSelectedType(type.label)}
                        />
                    ))}
                </div>

                {/* Section Couleur de Cheveux */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">
                    Couleur de cheveux
                </h2>

                <div className="flex justify-center gap-4 mb-16">
                    {hairColors.map((color) => (
                        <ChoiceCard
                            key={color.label}
                            label={color.label}
                            imagePath={color.imagePath}
                            isSelected={selectedColor === color.label}
                            onClick={() => setSelectedColor(color.label)}
                        />
                    ))}
                </div>

                {/* Bouton Suivant (Centré) */}
                <div className="flex justify-center">
                    <button className="w-[180px] py-4 rounded-xl bg-red-600 text-white text-xl font-bold hover:bg-red-700 transition-colors">
                        SUIVANT
                    </button>
                </div>
            </div>
        </div>
    );
}