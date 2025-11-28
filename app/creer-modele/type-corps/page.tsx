'use client'; 

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Note: Le store Zustand est adapté pour enregistrer des tableaux si nécessaire, mais l'interface `saveStep` doit le supporter.
import { useModelStore } from '../../../store/useModelStore'; 

// --- SIDEBAR (non modifié) ---
const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
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

// --- COMPOSANT CARD AVEC IMAGE ET LOGIQUE DE SÉLECTION ---
interface ChoiceCardProps {
    label: string;
    imagePath: string;
    onClick: () => void;
    isSelected: boolean; 
    sizeClasses?: string; 
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({ label, imagePath, onClick, isSelected, sizeClasses = 'w-40 h-56' }) => (
    <div
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${isSelected ? 'border-none' : 'border-transparent'}`}
    >
        <Image
            src={imagePath}
            alt={label}
            fill
            className={`object-cover transition-all duration-300 rounded-4xl
                ${isSelected ? "opacity-100 blur-0" : "opacity-44   -blur-[2px]"}
            `}
        />

        {/* Label */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-3 text-center">
            <span className="text-white text-lg font-bold z-10">{label}</span>
        </div>

        {/* Check icon */}
        {isSelected && (
            <div className="absolute top-2 right-2 z-20 w-7 h-7  rounded-full flex items-center justify-center">
               <Image src="/icons/check.png" alt="Sélectionné" width={16} height={16} />
            </div>
        )}
    </div>
);

// --- PAGE PRINCIPALE (Modification pour la sélection multiple) ---
export default function TypeCorpsPage() {
    const router = useRouter();

    // Store Zustand
    const { bodyType: storedBodyType, chestSize: storedChestSize, saveStep } = useModelStore();

    // États locaux
    // Changement : Utilisation d'un tableau (string[]) pour la sélection multiple
    const [bodyType, setBodyType] = useState<string[]>(Array.isArray(storedBodyType) ? storedBodyType : (storedBodyType ? [storedBodyType] : []));
    const [chestSize, setChestSize] = useState<string[]>(Array.isArray(storedChestSize) ? storedChestSize : (storedChestSize ? [storedChestSize] : []));


    // FONCTIONS DE GESTION DE LA SÉLECTION MULTIPLE
    
    const handleBodyTypeChange = (label: string) => {
        setBodyType(prev => {
            if (prev.includes(label)) {
                // Si déjà sélectionné, le retire
                return prev.filter(item => item !== label);
            } else {
                // Sinon, l'ajoute
                return [...prev, label];
            }
        });
    };

    const handleChestSizeChange = (label: string) => {
        setChestSize(prev => {
            if (prev.includes(label)) {
                // Si déjà sélectionné, le retire
                return prev.filter(item => item !== label);
            } else {
                // Sinon, l'ajoute
                return [...prev, label];
            }
        });
    };
    
    // DONNÉES AVEC CHEMINS D'IMAGE
    const bodyTypes = [
        { label: 'Musclé', imagePath: '/images/origine1.png' }, 
        { label: 'Moyen', imagePath: '/images/origine1.png' }, 
        { label: 'Pulpeux', imagePath: '/images/origine1.png' },
        { label: 'BBW', imagePath: '/images/origine1.png' }, 
    ];

    const chestSizesData = [ 
        { label: 'Petit', imagePath: '/images/origine1.png' }, 
        { label: 'Moyen', imagePath: '/images/origine1.png' }, 
        { label: 'Fort', imagePath: '/images/origine1.png' }, 
        { label: 'Extra Large', imagePath: '/images/origine1.png' }, 
    ];

    const handleNext = () => {
        // Enregistre les tableaux de sélections
        saveStep({ bodyType, chestSize });
        router.push('/creer-modele/personnalite'); // page suivante
    };
    
    // Le bouton Suivant est activé si au moins un élément est sélectionné dans CHAQUE catégorie
    const isNextButtonEnabled = bodyType.length > 0 && chestSize.length > 0;


    const renderCards = (
        options: { label: string, imagePath: string }[],
        selected: string[], // Changement : attend un tableau de sélections
        onChange: (value: string) => void, // Changement : attend la fonction de modification
        cardSizeClasses: string 
    ) => (
        <div className="flex justify-center gap-6 mb-16 flex-wrap">
            {options.map((opt) => (
                <ChoiceCard
                    key={opt.label}
                    label={opt.label}
                    imagePath={opt.imagePath}
                    // LOGIQUE DE SÉLECTION MULTIPLE : Vérifie si le label est inclus dans le tableau
                    isSelected={selected.includes(opt.label)} 
                    // LOGIQUE D'ACTION : Passe l'élément sélectionné à la fonction de modification
                    onClick={() => onChange(opt.label)} 
                    sizeClasses={cardSizeClasses} 
                />
            ))}
        </div>
    );
    
    // Définition des classes de taille
    const bodySizeClasses = 'w-40 h-50 '; 
    const chestSizeClasses = 'w-53 h-60 '; 


    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen flex flex-col items-center">
                
                {/* Icon user */}
                <div className="flex justify-end items-center mb-10 w-full">
                    <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </div>
                </div>

             

                {/* CHOIX DU TYPE DE CORPS (Sélection multiple) */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">Choisir le type de corps</h2>
                {renderCards(bodyTypes, bodyType, handleBodyTypeChange, bodySizeClasses)}

                {/* CHOIX DE LA TAILLE DE POITRINE (Sélection multiple) */}
                <h2 className="text-white text-3xl font-bold text-center mb-10">Choisissez la taille de poitrine</h2>
                {renderCards(chestSizesData, chestSize, handleChestSizeChange, chestSizeClasses)}

                {/* BOUTON SUIVANT */}
                <div className="flex justify-center mt-8">
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