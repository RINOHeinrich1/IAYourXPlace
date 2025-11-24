'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const handleSignUp = () => {
        router.push('/signup');
    };

    const handleCreator = () => {
        router.push('/creator');
    };

    const handleSignIn = () => {
        router.push('/login');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div
            className="relative min-h-screen w-full flex justify-center items-start bg-cover bg-center"
            style={{
                backgroundImage: 'url("/bgimage.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* --- Dégradé sombre minimal --- */}
            <div className="absolute inset-0 z-0 bg-black/80 pointer-events-none"></div>

            {/* Box principale */}
            <div
                className="relative z-10 mt-[44px] w-[400px] h-[500px] rounded-[32px] flex flex-col items-center gap-6 p-8"
                style={{
                    backgroundImage: 'url("/images/bgimageregister.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >

                {/* Contenu principal */}
                <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                    {/* Logo */}
                    <div className="-mt-2">

                        <img src="/logo.png" alt="Logo" className="w-[188px] h-[44px]" />
                    </div>

                    {/* Bouton S’inscrire */}
                    <button
                        onClick={handleSignUp}
                        className="cursor-pointer flex items-center justify-center gap-2 w-[180px] h-[45px] mt-27 rounded-[32px] bg-red-700 text-white font-medium text-base hover:bg-red-800 transition"
                    >
                        <img src="/images/iconinscrire.png" alt="Icon S'inscrire" className="w-6 h-6" />
                        S’inscrire
                    </button>

                    {/* Bouton Devenir créateur */}
                    <button
                        onClick={handleCreator}
                        className="cursor-pointer flex items-center justify-center gap-2 w-[185px] h-[45px] text-base -mt-3 rounded-[32px]"
                        style={{ backgroundColor: 'rgba(227,23,10,1)', color: 'white' }}
                    >
                        <img src="/images/iconcreateur.png" alt="Icon Devenir créateur" className="w-6 h-6" />
                        Devenir créateur
                    </button>

                    {/* Phrase en bas avec boutons */}
                    <div className="mt-19 flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center justify-center gap-2 w-full">
                            <span
                                className=" rounded-lg text-white text-sm"
 style={{ color: 'rgba(114, 107, 107, 1)' }}
                            >
                                Disposez-vous d’un compte ?
                            </span>
                            <button
                                onClick={handleSignIn}
                                className=" cursor-pointer rounded-lg text-white text-sm"
                                style={{ color: 'rgba(132,14,14,1)' }}
                            >
                                S’identifier
                            </button>
                        </div>

                        <button
                            onClick={handleBack}
                            className=" cursor-pointer rounded-lg text-white text-sm"
 style={{ color: 'rgba(114, 107, 107, 1)' }}
                        >
                            Revenir en arrière
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
