'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
            {aiNavItems.map((item) => {
                const isActive = item.active;
                const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${isActive ? ' font-semibold' : 'text-gray-400 hover:text-white'
                    }`;

                return item.href ? (
                    <Link href={item.href} key={item.name} className={classes}>
                        <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                        <span>{item.name}</span>
                    </Link>
                ) : (
                    <div key={item.name} className={classes}>
                        <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                        <span>{item.name}</span>
                    </div>
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



export default function CreerModelePage() {
    const [selectedGender, setSelectedGender] = useState<'femmes' | 'hommes'>('femmes');
    const [selectedAge, setSelectedAge] = useState<number>(22);

    // Données pour les cartes d'origine ethnique
    const ethnicOrigins = [
        // J'utilise le chemin générique A.jpg que vous avez fourni.
        { name: 'Occidental', image: '/images/A.jpg' },
        { name: 'Asiatique', image: '/images/A.jpg' },
        { name: 'Africaine', image: '/images/A.jpg' },
        { name: 'Latina', image: '/images/A.jpg' },
    ];

    const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAge(Number(event.target.value));
    };

    const minAge = 18;
    const maxAge = 39;

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">

                {/* Liens Femmes / Hommes et icône utilisateur */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedGender('femmes')}
                            className={`relative text-lg font-bold group pb-2 focus:outline-none ${selectedGender === 'femmes' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}
                        >
                            Femmes
                            {selectedGender === 'femmes' && (
                                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-red-600"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setSelectedGender('hommes')}
                            className={`relative text-lg font-bold group pb-2 focus:outline-none ${selectedGender === 'hommes' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}
                        >
                            Hommes
                            {selectedGender === 'hommes' && (
                                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-red-600"></span>
                            )}
                        </button>
                    </div>
                    {/* Icon utilisateur */}
                    <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </div>
                </div>

                {/* Titre principal rouge */}
                <h1 className="text-red-600 text-4xl font-bold mb-10">
                    Créer ma {selectedGender === 'femmes' ? 'copine' : 'partenaire'} IA
                </h1>

                <h2 className="text-white text-2xl font-bold text-center mb-8">
                    Choisir l'origine ethnique
                </h2>


                <div className="flex justify-center gap-4 mb-12"> {/* gap-4 pour un espacement réduit */}
                    {ethnicOrigins.map((origin, index) => (
                        <div key={index} className="relative w-48 h-64 rounded-2xl overflow-hidden cursor-pointer group"> {/* Taille réduite */}
                            <Image
                                src={origin.image}
                                alt={origin.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-2xl transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                <span className="text-white text-xl font-bold">{origin.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- NOUVEAU CONTENU : Choisir l'âge + Slider --- */}

                {/* Deuxième petit titre blanc centré : Choisir l'âge */}
                <h2 className="text-white text-2xl font-bold text-center mb-8">
                    Choisir l'âge
                </h2>

                {/* Conteneur du Slider */}
                <div className="flex flex-col items-center w-full">
                    <div className="w-[600px] p-6 rounded-2xl bg-white/5 relative">
                        {/* Indicateur d'âge */}
                        <div
                            className="absolute top-[-40px] z-10 bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-md"
                            style={{
                                left: `calc(${((selectedAge - minAge) / (maxAge - minAge)) * 100}% - 25px)`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {selectedAge} ANS
                        </div>

                        {/* Slider réel */}
                        <input
                            type="range"
                            min={minAge}
                            max={maxAge}
                            value={selectedAge}
                            onChange={handleAgeChange}
                            className="w-full h-2 appearance-none bg-gray-700 rounded-full accent-red-600"
                            style={{
                                // Customisation pour ressembler au design
                                background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${((selectedAge - minAge) / (maxAge - minAge)) * 100}%, #4b5563 ${((selectedAge - minAge) / (maxAge - minAge)) * 100}%, #4b5563 100%)`,
                            }}
                        />

                        {/* Labels min et max */}
                        <div className="flex justify-between text-gray-400 text-sm mt-2 font-bold">
                            <span>{minAge}</span>
                            <span>{maxAge}+</span>
                        </div>
                    </div>

                    <Link
                        href="/creer-modele/type-cheveux"
                        className="mt-12 w-[180px] py-4 rounded-xl bg-red-600 text-white text-xl font-bold hover:bg-red-700 transition-colors inline-block text-center"
                    >
                        SUIVANT
                    </Link>
                </div>
            </div>
        </div>
    );
}