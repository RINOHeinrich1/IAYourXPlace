'use client';

import React, { useState } from "react";
import Link from "next/link";

export default function PopupVideo() {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleClick = () => setIsPlaying(true);

    return (
        <div
            className="w-full min-h-screen bg-cover bg-center flex flex-col items-center relative"
            style={{
                backgroundImage: "url('/bgimage2.png')",
            }}
        >
            {/* Overlay + flou réduit */}
            <div
                className="absolute inset-0"
                style={{
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                }}
            ></div>

            {/* Grand icone de FERMETURE en haut à droite (hors de la vidéo) */}
            <div className="absolute top-4 right-4 w-16 h-18 z-20">
                <Link href="/video"> {/* Remplace /generer par la page vidéo */}
                    <img
                        src="/icons/close.png"
                        className="w-22 h-18 cursor-pointer"
                        alt="close icon"
                    />
                </Link>
            </div>
            
            {/* Card centrale */}
            <div
                className="relative cursor-pointer mt-20 z-10"
                style={{
                    marginBottom: "44px",
                    width: "550px",
                    height: "580px",
                    borderRadius: "16px",
                    opacity: 1,
                    animationDuration: "0ms",
                    overflow: "hidden",
                }}
                onClick={handleClick}
            >
                {/* BLOC AJOUTÉ : Icône de téléchargement dans le coin supérieur droit du cadre de la vidéo */}
                <a 
                    href="/videos/mock.mp4" 
                    download 
                    className="absolute top-4 right-4 z-20" // Positionné à l'intérieur de la carte centrale
                    onClick={(e) => e.stopPropagation()} // Empêche l'icône de déclencher la lecture de la vidéo
                >
                    <div className="w-8 h-8 flex justify-center items-center bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <img
                            src="/icons/ci_download.png" // Assurez-vous d'avoir cette icône dans public/icons
                            alt="Télécharger"
                            className="w-4 h-4"
                        />
                    </div>
                </a>
                
                {!isPlaying ? (
                    <>
                        {/* IMAGE MINIATURE */}
                        <img
                            src="/images/generer1.jpg"
                            alt="img1"
                            className="rounded-2xl object-cover"
                            style={{
                                width: "550px",
                                height: "580px",
                            }}
                        />

                        {/* ICON PLAY AU CENTRE */}
                        <div className="absolute inset-0 flex justify-center items-center z-10">
                            <div className="w-16 h-16 flex justify-center items-center">
                                <img
                                    src="/icons/playimage.png"
                                    alt="Play Icon"
                                    className="w-10 h-10"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* VIDEO MOCK */}
                        <video
                            src="/videos/mock.mp4"
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />

                    </>
                )}
            </div>
        </div>
    );
}