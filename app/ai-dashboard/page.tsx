'use client'; // Indique à Next.js que ce fichier utilise les Hooks React (état, etc.)

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { Search, ChevronDown } from 'lucide-react'; 

// --- DONNÉES SPÉCIFIQUES AI ---
const aiNavItems = [
    { name: 'Discuter', iconPath: '/images/home.png' }, 
    { name: 'Collecter', iconPath: '/images/home.png' },
    { name: 'Générer', iconPath: '/images/home.png' },
    { name: 'Model IA', iconPath: '/images/reel.png' },
    { name: 'Mes IA', iconPath: '/images/reel.png' },
];

const backItem = { 
    name: 'Revenir dans myXplace', 
    iconPath: '/images/home.png', // Utilisez l'icône Home pour le retour
    href: '/', // Lien vers la page d'accueil
};


// ----------------------------------------------------------------
// --- Composant de la Page AI (Client) ---
// ----------------------------------------------------------------

export default function AiDashboardPage() {

  // --- Sidebar (Mode AI) ---
  const Sidebar = () => (
    <div className="w-64 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 
                    border-r border-solid border-gray-400/50"> 
        
        {/* Logo Image */}
        <div className="mb-10 mt-2">
            <Image src="/logo.png" alt="my X place Logo" width={188} height={44} />
        </div>
        
        {/* MODE AI MENU */}
        <nav className="space-y-3">
            
            {aiNavItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer
                  text-gray-400 hover:text-white hover:bg-neutral-800`
                }
              >
                <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                <span>{item.name}</span>
              </div>
            ))}
            
            {/* Élément "Revenir dans myXplace" */}
            <div className="pt-6">
                <Link 
                    href={backItem.href} // Retourne à la page d'accueil
                    className={`w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer bg-neutral-800 text-white hover:bg-red-600`}
                >
                    <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
                    <span>{backItem.name}</span>
                </Link>
            </div>
        </nav>
    </div>
  );

  // --- Header (Mode AI) : Seulement l'icône utilisateur ---
  const Header = () => (
    <header className="fixed top-0 left-64 right-0 z-20 p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex justify-end items-center h-12">
            <div className="flex items-center space-x-4">
                <Image src={'/images/iconuser.png'} alt="User Icon" width={28} height={28} className="rounded-full" />
            </div>
        </div>
    </header>
  );

  // --- Rendu de la Page AI ---
  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <Header />
      
      {/* Main Content Area: pt-20 car le header est plus court */}
      <main className={`ml-64 pt-20 p-8`}>
        
        {/* TITRE principal */}
        <h1 className="text-4xl font-extrabold mb-8">Mon Tableau de Bord IA</h1>
        
        {/* Contenu spécifique au mode IA */}
        <div className="h-96 border border-neutral-800 p-4 rounded-xl text-neutral-500">
            Ceci est le contenu du Tableau de Bord MyModel AI.
        </div>
        
      </main>
    </div>
  );
}