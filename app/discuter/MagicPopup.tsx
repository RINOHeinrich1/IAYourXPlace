"use client";

import React from "react";
import { useRouter } from 'next/navigation';

interface MagicPopupProps {
    isOpen: boolean;
}

export default function MagicPopup({ isOpen }: MagicPopupProps) {
    const router = useRouter();

    // La logique de redirection utilise maintenant l'URL statique demandée
    const handleRedirect = () => {
        // Redirection vers l'URL exacte fournie
        router.push(
            `/generation?img=${encodeURIComponent('/images/imgmes2.jpg')}&name=${encodeURIComponent('Special Card')}`
        );
        // Note: Le 'http://localhost:3000' est implicite si vous utilisez un chemin relatif.
        // Si vous le voulez absolument en absolu, utilisez l'URL complète, mais le chemin relatif est standard dans Next.js.
    };

    return (
        <button
            // Utilise la fonction de redirection
            onClick={handleRedirect}
            // Classes Tailwind pour le positionnement et l'animation
            className={`
                absolute top-12 right-0 z-50
                flex items-center justify-center
                
                // *** CORRECTION TAILLE BOUTON : Réduit de h-14 à h-12 pour compacité ***
                h-12 
                // *** CORRECTION PADDING : Réduit de px-8 à px-6 ***
                px-6 
                
                rounded-full 
                shadow-lg
                whitespace-nowrap // Empêche le texte de se casser
                
                // Style de texte
                // *** CORRECTION TAILLE TEXTE : Réduit de text-2xl à text-lg ***
                text-white text-lg font-medium 
                
                // Classes d'animation de base
                transition-all duration-300 ease-in-out
                
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
            `}
            style={{
                backgroundColor: 'rgba(50, 50, 50, 0.9)', 
                minWidth: '220px', 
            }}
        >
            generer image & video
        </button>
    );
}