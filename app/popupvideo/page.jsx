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
          
            <div
                className="absolute inset-0"
                style={{
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                }}
            ></div>

            {/* Grand icone en haut à droite (hors de la vidéo) */}
            <div className="absolute top-4 right-4 w-16 h-18 z-20">
                <Link href="/video"> 
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
                {!isPlaying ? (
                    <>
                        {/* IMAGE MINIATURE */}
                        <img
                            src="/images/colection3.png"
                            alt="img1"
                            className="rounded-2xl object-cover"
                            style={{
                                width: "550px",
                                height: "580px",
                            }}
                        />

                        {/* PROFIL + NOM en haut */}
                        <div className="absolute top-7 left-4 flex items-center gap-2 z-20">
                            <img
                                src="/images/mock.png"
                                alt="profile"
                                className="w-15 h-14 rounded-full object-cover"
                            />
                            <p className="text-white text-lg font-semibold">Luna</p>
                        </div>

                        {/* ICON PLAY AU CENTRE */}
                        <div className="absolute inset-0 flex justify-center items-center z-10">
                            <div className="w-16 h-16 bg-black/40 rounded-full flex justify-center items-center">
                                <svg
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M8 5v14l11-7L8 5z" />
                                </svg>
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

                        {/* PROFIL + NOM en haut dans la vidéo */}
                        <div className="absolute top-7 left-4 flex items-center gap-2 z-20">
                            <img
                                src="/images/mock.png"
                                alt="profile"
                                className="w-15 h-14 rounded-full object-cover"
                            />
                            <p className="text-white text-lg font-semibold">Luna</p>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}
