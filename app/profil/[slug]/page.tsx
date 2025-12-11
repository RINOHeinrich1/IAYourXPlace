'use client';

import Image from "next/image";
import AIImage from "../../components/AIImage";
import { useState, useEffect, use } from "react";
import Sidebar from "../../components/Sidebar";
import ProfileNav from "../../components/ProfileNav";
import UserMenuDropdown from '../../components/UserMenuDropdown';
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';

const SIDEBAR_MARGIN_CLASS = "ml-80";

interface AIModel {
    id: string;
    name: string;
    description?: string;
    personality?: string;
    avatar_url?: string;
    age?: number;
    created_at: string;
}

function CharacterProfileContent({ slug }: { slug: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [character, setCharacter] = useState<AIModel | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const characterId = searchParams.get('id');

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const response = await fetch('/api/ai-profiles');
                if (response.ok) {
                    const data = await response.json();
                    const models = data.models || data.profiles || [];
                    // Find by ID first, then by slug
                    const found = characterId
                        ? models.find((m: AIModel) => m.id === characterId)
                        : models.find((m: AIModel) =>
                            m.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
                          );
                    setCharacter(found || null);

                    // Check if user is already subscribed to this character
                    if (found) {
                        try {
                            const subResponse = await fetch(`/api/subscriptions/ai-character?check=${found.id}`);
                            if (subResponse.ok) {
                                const subData = await subResponse.json();
                                setIsSubscribed(subData.isSubscribed || false);
                            }
                        } catch (subError) {
                            console.error('Error checking subscription:', subError);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching character:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCharacter();
    }, [slug, characterId]);

    const handleSubscribe = async () => {
        if (!character) return;
        try {
            const response = await fetch('/api/subscriptions/ai-character', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ai_model_id: character.id }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Use the actual subscription state from the API response
                setIsSubscribed(data.subscribed);
            } else if (data.error) {
                console.error('Subscription error:', data.error);
                alert(data.error === 'Non autorisé' ? 'Veuillez vous connecter pour vous abonner' : data.error);
            }
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    const handleWrite = () => {
        if (character) {
            router.push(`/discuter?modelId=${character.id}&modelName=${encodeURIComponent(character.name)}`);
        } else {
            router.push("/discuter");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-xl">Chargement...</p>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-xl">Personnage non trouvé</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />
            <div className="absolute top-4 right-4 z-50">
                <button
                    className="w-10 h-10 rounded-full flex items-center cursor-pointer justify-center"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Image src="/images/iconuser.png" alt="User" width={24} height={24} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 -mt-9 w-40 rounded-lg shadow-lg p-2">
                        <UserMenuDropdown isOpen={isMenuOpen} />
                    </div>
                )}
            </div>

            <div className={`flex-1 p-6 ${SIDEBAR_MARGIN_CLASS} max-w-5xl mr-auto`}>
                <div className="relative mt-17 w-full h-56 opacity-111 rounded-xl overflow-hidden mb-8">
                    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-9">
                        <div className="absolute inset-0">
                            <Image src="/images/sexi.jpg" alt="Cover" fill style={{ objectFit: "cover" }} className="rounded-xl" />
                        </div>
                        <div className="absolute inset-0 bg-black/70 rounded-xl"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black via-black/90 to-transparent rounded-b-xl" />
                    <div className="absolute bottom-19 left-6 w-32 h-32 rounded-full overflow-hidden">
                        <AIImage src={character.avatar_url || '/images/A.jpg'} alt={character.name} width={159} height={150} className="object-cover" />
                    </div>
                    <div className="absolute bottom-24 left-48 z-10">
                        <h2 className="text-2xl font-bold">{character.name}</h2>
                        <p className="text-base text-white/90">{character.age || 25} ans</p>
                    </div>
                    <div className="absolute top-4 right-6 flex gap-8 text-white text-center z-10">
                        <div><p className="font-bold text-2xl">1M</p><span className="text-sm text-white/70">Likes</span></div>
                        <div><p className="font-bold text-2xl">123</p><span className="text-sm text-white/70">Photos</span></div>
                        <div><p className="font-bold text-2xl">25</p><span className="text-sm text-white/70">Videos</span></div>
                    </div>
                </div>
                <div className="pl-50">
                    <p className="text-white/80 text-base leading-6 mb-4 max-w-xl">
                        {character.description || character.personality || 'Une IA créée par les administrateurs.'}
                    </p>
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleSubscribe}
                            className="px-6 py-2 cursor-pointer rounded-lg font-semibold text-base transition-colors"
                            style={{ background: isSubscribed ? "rgb(91, 0, 0)" : "rgba(80, 80, 80, 1)" }}
                        >
                            {isSubscribed ? "Abonné(e)" : "S'abonner"}
                        </button>
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
            </div>
        </div>
    );
}

export default function CharacterProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><p>Chargement...</p></div>}>
            <CharacterProfileContent slug={resolvedParams.slug} />
        </Suspense>
    );
}

