'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', active: true, iconPath: '/images/mesia.png', href: '/mesia' }, // ACTIVE
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


// Données mock pour les IA
const mockIA = {
    name: "Elizabeth Garcia",
    age: 22,
    description: "Étudiante passionnée de séries, amatrice de soirées et férue de voiture.",
    imagePath: "/images/imgmes1.png",
};

export default function MesIA() {
    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-white text-4xl font-extrabold tracking-wide">
                        Mon <span className="text-red-600">IA</span>
                    </h1>

                    <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </div>
                </div>


                <div className="flex gap-8 mt-16">


                    <Link href="/creer-modele" className="block">
                        <div className="w-80 h-88 bg-red-600 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-red-700 transition-colors shadow-2xl">
                            <div className="mb-4">

                                <Image src="/icons/plus.png" alt="Discuter" width={38} height={18} />

                            </div>
                            <span className="text-white text-2xl font-bold mt-4">
                                Créer une nouvelle IA
                            </span>
                        </div>
                    </Link>


                    <div className="relative w-80 h-88 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        {/* Image de l'IA */}
                        <Image
                            src={mockIA.imagePath}
                            alt={mockIA.name}
                            layout="fill"
                            objectFit="cover"
                            className="absolute z-0"

                            style={{ filter: 'brightness(0.95)' }}
                        />


                        <div className="absolute top-4 right-4 z-10  rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                            <Image src="/icons/chat.png" alt="Discuter" width={38} height={18} />
                        </div>

                        {/* Contenu textuel de l'IA */}
                        <div
                            className="absolute bottom-0 left-0 w-full p-5 z-10"
                            style={{

                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)'
                            }}
                        >
                            <h2 className="text-white text-2xl font-bold mb-1">{mockIA.name}</h2>
                            <p className="text-gray-200 text-sm mb-2">{mockIA.age} ans</p>
                            <p className="text-white text-base leading-snug">
                                {mockIA.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}