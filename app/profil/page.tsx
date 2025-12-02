'use client';

import Image from "next/image";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ProfileNav from "../components/ProfileNav";
import UserMenuDropdown from '../components/UserMenuDropdown';
import { useRouter } from "next/navigation";

const SIDEBAR_MARGIN_CLASS = "ml-80";

export default function ProfilPage() {
    // usericon
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Variables pour un ajustement facile
    const AVATAR_BOTTOM_CLASS = "-bottom-5"; // Monté
    const NAME_AGE_BOTTOM_CLASS = "bottom-5"; // Monté


    const [isSubscribed, setIsSubscribed] = useState(false);
    const router = useRouter();

    const handleSubscribe = () => {
        setIsSubscribed(!isSubscribed);
    };
    const handleWrite = () => {
        router.push("/discuter");
    };


    return (

        <div className="min-h-screen bg-black text-white flex">

            <Sidebar />


            <div className="absolute top-4 right-4 z-50">
                <button
                    className="w-10 h-10 rounded-full flex items-center cursor-pointer justify-center "
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Image src="/images/iconuser.png" alt="User" width={24} height={24} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 -mt-9 w-40 rounded-lg shadow-lg p-2 ">
                        <UserMenuDropdown isOpen={isMenuOpen} />
                    </div>
                )}
            </div>
            <div className="mt-99"></div>


            <div className={`flex-1 p-6 ${SIDEBAR_MARGIN_CLASS} max-w-5xl mr-auto`}>

                <div className="relative mt-17 w-full h-56 opacity-111 rounded-xl overflow-hidden mb-8"> {/* mb réduite */}

                    {/* Header profil - image de couverture */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-9">

                        {/* Image de fond */}
                        <div className="absolute inset-0">
                            <Image
                                src="/images/sexi.jpg"
                                alt="Cover"
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/70 rounded-xl"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black via-black/90 to-transparent rounded-b-xl" />

                    {/* Photo de profil (avatar) */}
                    <div className="absolute bottom-19 left-6 w-32 h-32 rounded-full overflow-hidden">
                        <Image
                            src="/images/generer1.jpg"
                            alt="User"
                            width={159}
                            height={150}
                            className="object-cover"
                        />
                    </div>

                    {/* Nom et âge – décalé plus à droite */}
                    <div className="absolute bottom-24 left-48 z-10">
                        <h2 className="text-2xl font-bold">Luissiana_RL</h2>
                        <p className="text-base text-white/90">23 ans</p>
                    </div>


                    {/* Stats */}
                    <div className="absolute  top-4 right-6 flex gap-8 text-white text-center z-10">
                        <div>
                            <p className="font-bold text-2xl">1M</p>
                            <span className="text-sm text-white/70">Likes</span>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">123</p>
                            <span className="text-sm text-white/70">Photos</span>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">25</p>
                            <span className="text-sm text-white/70">Videos</span>
                        </div>
                    </div>
                </div>



                <div className="pl-50">

                    {/* 1. Description (Texte) */}
                    <p className="text-white/80 text-base leading-6 mb-4 max-w-xl">
                        une étudiante en médecine allemande connue<br />  pour son charme et son sourire.

                    </p>

                    {/* 2. Boutons */}
                    <div className="flex gap-4 mb-8">
                        {/* Bouton S'abonner */}
                        <button
                            onClick={handleSubscribe}
                            className="px-6 py-2 cursor-pointer rounded-lg font-semibold text-base transition-colors"
                            style={{
                                background: isSubscribed ? "rgba(80, 80, 80, 1)" : "rgba(91, 0, 0, 1)",
                            }}
                        >
                            {isSubscribed ? "Abonné(e)" : "S'abonner"}
                        </button>


                        {/* Bouton Écrire */}
                        <button
                            onClick={handleWrite}
                            className="px-6 py-2 rounded-lg cursor-pointer font-semibold text-base transition-colors"
                            style={{ background: "rgba(80, 80, 80, 1)" }}
                        >
                            Écrire
                        </button>
                    </div>
                </div>

                <ProfileNav />

                {/* Galerie - 3 images par ligne */}

            </div>

        </div>
    );
}