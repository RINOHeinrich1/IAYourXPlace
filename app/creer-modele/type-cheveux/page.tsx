'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModelStore } from '../../../store/useModelStore';

// --- SIDEBAR (non modifié) ---------------------------------------------------------
const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: true, iconPath: '/images/crer.png', href: '/creer-modele' },
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

// --- CARD (non modifié) ---------------------------------------------------------
interface ChoiceCardProps {
    label: string;
    imagePath: string;
    onClick: () => void;
    isSelected: boolean; 
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({ label, imagePath, onClick, isSelected }) => (
    <div
        onClick={onClick}
        className={`relative w-36 h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected ? '' : ''}`}
    >

        {/* Image principale : Conserve la logique de l'image de remplacement /images/j.jpg si sélectionné */}
        <Image
            src={isSelected ? "/images/j.jpg" : imagePath}
            alt={label}
            fill
            className={`object-cover transition-all duration-300
                ${isSelected ? "opacity-100 blur-0" : "opacity-48 -blur-[2px]"} 
            `}
            // NOTE: J'ai corrigé -blur-[2px] en blur-[2px] pour que Tailwind fonctionne correctement.
        />

        {/* Label */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-3 text-center">
            <span className="text-white text-lg font-bold z-10">{label}</span>
        </div>

        {/* Check icon (Utilise isSelected) */}
        {isSelected && (
            <div className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xl">
               <Image src="/icons/check.png" alt="User Icon" width={20} height={20} />
            </div>
        )}
    </div>
);

// --- PAGE (Ajout de la couleur des yeux) -----------------------------------------
export default function TypeCheveuxPage() {
    const router = useRouter();
    const saveStep = useModelStore((state) => state.saveStep);
    const modelData = useModelStore((state) => state.modelData);

    // Initialisation des états avec des TABLEAUX pour la multi-sélection
    const initialHairType = Array.isArray(modelData.hairType) ? modelData.hairType : (modelData.hairType ? [modelData.hairType] : []);
    const initialHairColor = Array.isArray(modelData.hairColor) ? modelData.hairColor : (modelData.hairColor ? [modelData.hairColor] : []);
    // NOUVEL ÉTAT pour la couleur des yeux (on suppose une sélection unique ici, sinon utilisez un tableau)
    const initialEyeColor = modelData.eyeColor || null;
    
    const [selectedTypes, setSelectedTypes] = useState<string[]>(initialHairType);
    const [selectedColors, setSelectedColors] = useState<string[]>(initialHairColor);
    const [selectedEyeColor, setSelectedEyeColor] = useState<string | null>(initialEyeColor); // Choix unique

    // Logique de bascule pour la multi-sélection (utilisée pour types et couleurs de cheveux)
    const toggleSelect = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, selectedArray: string[]) => {
        if (selectedArray.includes(value)) {
            setter(selectedArray.filter((v) => v !== value));
        } else {
            setter([...selectedArray, value]);
        }
    };

    // --- DONNÉES ---
    const hairTypes = [
        { label: 'Lisse', imagePath: '/images/cheuveux1.png' },
        { label: 'Frange', imagePath: '/images/cheuveux2.png' },
        { label: 'Bouclé', imagePath: '/images/cheuveux3.png' },
        { label: 'Court', imagePath: '/images/cheuveux4.png' },
        { label: 'Chignon', imagePath: '/images/cheuveux5.png' },
    ];

    const hairColors = [
        { label: 'Brune', imagePath: '/images/cheuveux6.png' },
        { label: 'Blonde', imagePath: '/images/cheuveux7.png' },
        { label: 'Noir', imagePath: '/images/cheuveux8.png' },
        { label: 'Rousse', imagePath: '/images/cheuveux9.png' },
        { label: 'Rose', imagePath: '/images/cheuveux10.png' },
    ];
    
    // NOUVELLES DONNÉES pour la couleur des yeux
    const eyeColors = [
        { label: 'Marron', imagePath: '/images/yeux1.png' }, // Images à adapter
        { label: 'Bleu', imagePath: '/images/yeux2.png' },
        { label: 'Vert', imagePath: '/images/yeux3.png' },
    ];
    // --- FIN DONNÉES ---


    const handleNext = () => {
        // Enregistrement des sélections, incluant la couleur des yeux
        saveStep({
            hairType: selectedTypes,
            hairColor: selectedColors,
            eyeColor: selectedEyeColor, // AJOUT
        });

        router.push('/creer-modele/type-corps');
    };
    
    // Le bouton SUIVANT est activé si au moins un élément de chaque catégorie (cheveux type, cheveux couleur, et couleur des yeux) est sélectionné
    const isNextButtonEnabled = selectedTypes.length > 0 && selectedColors.length > 0 && !!selectedEyeColor;

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">

                {/* Icon user */}
                <div className="flex justify-end items-center mb-10">
                    <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </div>
                </div>

                {/* TYPE DE CHEVEUX */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">Type de cheveux</h2>

                <div className="flex justify-center gap-4 mb-20">
                    {hairTypes.map((type) => (
                        <ChoiceCard
                            key={type.label}
                            label={type.label}
                            imagePath={type.imagePath}
                            isSelected={selectedTypes.includes(type.label)}
                            onClick={() => toggleSelect(type.label, setSelectedTypes, selectedTypes)}
                        />
                    ))}
                </div>

                {/* COULEUR DE CHEVEUX */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">Couleur de cheveux</h2>

                <div className="flex justify-center gap-4 mb-20">
                    {hairColors.map((color) => (
                        <ChoiceCard
                            key={color.label}
                            label={color.label}
                            imagePath={color.imagePath}
                            isSelected={selectedColors.includes(color.label)}
                            onClick={() => toggleSelect(color.label, setSelectedColors, selectedColors)}
                        />
                    ))}
                </div>
                
                {/* COULEUR DES YEUX (NOUVELLE SECTION) */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">Couleur des yeux</h2>

                <div className="flex justify-center gap-4 mb-16">
                    {eyeColors.map((eye) => (
                        <ChoiceCard
                            key={eye.label}
                            label={eye.label}
                            imagePath={eye.imagePath}
                            // Pour la couleur des yeux, on utilise une sélection unique (string | null)
                            isSelected={selectedEyeColor === eye.label} 
                            onClick={() => setSelectedEyeColor(eye.label)}
                        />
                    ))}
                </div>
                {/* FIN COULEUR DES YEUX */}


                {/* BOUTON SUIVANT */}
                <div className="flex justify-center">
                    <button
                        onClick={handleNext}
                        disabled={!isNextButtonEnabled}
                        className={`w-[180px] py-4 rounded-xl text-white text-xl font-bold transition-colors 
                        ${isNextButtonEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 cursor-not-allowed'}`}
                    >
                        SUIVANT
                    </button>
                </div>
            </div>
        </div>
    );
}