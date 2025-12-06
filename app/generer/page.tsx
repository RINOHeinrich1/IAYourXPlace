'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabaseClient';

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
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
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${isActive ? ' font-semibold' : 'text-gray-400 hover:text-white'}`;
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
        <Link href={backItem.href} className="w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600">
          <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
          <span>{backItem.name}</span>
        </Link>
      </div>
    </nav>
  </div>
);

interface AIModel { id: string; name: string; avatar_url?: string; age?: number; description?: string; }
type TabType = 'post' | 'au-feeling' | 'mes-ia';

export default function GenererPage() {
  const tabs: { id: TabType; title: string }[] = [
    { id: 'post', title: 'Post' },
    { id: 'au-feeling', title: 'Au feeling' },
    { id: 'mes-ia', title: 'Mes IA' },
  ];

  // State for admin AI characters (POST tab)
  const [adminAIModels, setAdminAIModels] = useState<AIModel[]>([]);
  const [loadingAdminModels, setLoadingAdminModels] = useState(true);

  const ethnicOrigins = [
    { name: 'Occidental', image: '/images/origine1.png' },
    { name: 'Asiatique', image: '/images/origine2.png' },
    { name: 'Africaine', image: '/images/origine3.png' },
    { name: 'Latina', image: '/images/origine4.png' },
  ];

  const [activeTab, setActiveTab] = useState<TabType>('post');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [age, setAge] = useState<number>(22);
  const [userAIModels, setUserAIModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const router = useRouter();

  // Fetch admin AI models for POST tab on mount
  useEffect(() => {
    const fetchAdminAIModels = async () => {
      setLoadingAdminModels(true);
      try {
        const response = await fetch('/api/ai-profiles?adminOnly=true');
        const data = await response.json();
        if (data.profiles) {
          setAdminAIModels(data.profiles);
        }
      } catch (error) {
        console.error('Error fetching admin AI models:', error);
      }
      setLoadingAdminModels(false);
    };
    fetchAdminAIModels();
  }, []);

  // Fetch user AI models for "Mes IA" tab
  useEffect(() => {
    if (activeTab === 'mes-ia') {
      const fetchUserAIModels = async () => {
        setLoadingModels(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('ai_models')
            .select('id, name, avatar_url, age')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
          if (!error && data) setUserAIModels(data);
        }
        setLoadingModels(false);
      };
      fetchUserAIModels();
    }
  }, [activeTab]);

  // Helper to create URL-friendly slug from name
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '');        // Remove leading/trailing hyphens
  };

  // Handle character selection and redirect to generation page
  const handleSelectCharacter = (model: AIModel) => {
    const slug = createSlug(model.name);
    localStorage.setItem('selectedCharacter', JSON.stringify({
      id: model.id,
      name: model.name,
      src: model.avatar_url || '/images/mock.png',
      slug: slug
    }));
    router.push(`/generation/${slug}`);
  };

  const handleSelectAIModel = (model: AIModel) => {
    handleSelectCharacter(model);
  };

  const closePopup = () => setSelectedModel(null);

  const toggleEthnicity = (name: string) => {
    if (selectedEthnicities.includes(name)) {
      setSelectedEthnicities(selectedEthnicities.filter((e) => e !== name));
    } else {
      setSelectedEthnicities([...selectedEthnicities, name]);
    }
  };

  const handleAuFeelingNext = () => {
    localStorage.setItem('auFeelingPreferences', JSON.stringify({ ethnicities: selectedEthnicities, age }));
    router.push('/generation');
  };

  const getPageTitle = () => {
    if (activeTab === 'au-feeling') {
      return <h1 className="text-[rgba(217,26,42,1)] text-4xl font-bold mb-8">Creer une personnage IA</h1>;
    }
    return (
      <>
        <h1 className="font-montserrat text-3xl font-bold mb-2 mt-22">Generateur d&apos;Images et videos</h1>
        <h2 className="text-white font-bold mb-6">Choisir un personnage</h2>
      </>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen relative">
        <div className="absolute top-4 right-4">
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white mt-3 bg-white/10 mr-8">
            <Image src={'/images/iconuser.png'} alt="User Icon" width={20} height={20} />
          </div>
        </div>
        {getPageTitle()}

        {/* Tab navigation */}
        <div className="flex space-x-4 mb-10 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-1 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'text-white font-bold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-red-600'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-black min-h-[60vh] text-white">

          {/* POST TAB - Admin AI characters from database */}
          {activeTab === 'post' && (
            <div className="p-4">
              {loadingAdminModels ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                  <p className="text-xl text-gray-400 ml-4">Chargement des personnages...</p>
                </div>
              ) : adminAIModels.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-9">
                  {adminAIModels.map((model) => (
                    <div
                      key={model.id}
                      className="relative w-55 h-66 rounded-5xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                      onClick={() => setSelectedModel(model)}
                    >
                      {model.avatar_url ? (
                        <Image src={model.avatar_url} alt={model.name} fill className="object-cover rounded-4xl" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-purple-600/30 rounded-4xl" />
                      )}
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[170px] text-center py-2 rounded-3xl"
                        style={{ background: 'linear-gradient(199deg, rgba(255,255,255,0.25) 88%, rgba(255,255,255,0.1) 190%)' }}
                      >
                        <span className="text-white font-semibold text-sm">{model.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-xl text-gray-400">Aucun personnage disponible.</p>
                </div>
              )}
              {selectedModel && (
                <div
                  className="fixed bottom-0 ml-38 left-1/2 -translate-x-1/2 w-[1027px] h-[346px] rounded-t-[32px] backdrop-blur-[40px] p-6 z-50"
                  style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)' }}
                >
                  <div className="flex flex-col items-center justify-center h-full relative">
                    {/* Character preview */}
                    <div className="flex items-center gap-6 mb-6 -mt-16">
                      <div className="relative w-32 h-40 rounded-2xl overflow-hidden">
                        {selectedModel.avatar_url ? (
                          <Image src={selectedModel.avatar_url} alt={selectedModel.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-purple-600/30" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white text-2xl font-bold">{selectedModel.name}</h3>
                        {selectedModel.description && (
                          <p className="text-gray-300 text-sm mt-1 max-w-md">{selectedModel.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => selectedModel && handleSelectCharacter(selectedModel)}
                      className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                    >
                      Sélectionner ce personnage
                    </button>
                    <button onClick={closePopup} className="absolute top-4 right-4 text-white text-xl font-bold hover:text-red-400 transition">✕</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AU FEELING TAB */}
          {activeTab === 'au-feeling' && (
            <div className="flex flex-col items-center">
              <h2 className="text-white text-2xl font-bold text-center mb-9">Choisir l&apos;origine ethnique</h2>
              <div className="flex justify-center gap-4 mb-8 flex-wrap">
                {ethnicOrigins.map((origin) => {
                  const isSelected = selectedEthnicities.includes(origin.name);
                  return (
                    <div
                      key={origin.name}
                      className="relative w-48 h-64 rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => toggleEthnicity(origin.name)}
                    >
                      <Image
                        src={origin.image}
                        alt={origin.name}
                        fill
                        className={`object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 ${!isSelected ? 'opacity-50' : ''}`}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6">
                          <Image src="/icons/check.png" alt="Selected" width={24} height={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <span className="text-white text-xl font-bold">{origin.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="w-full max-w-md flex flex-col items-center mt-8">
                <h2 className="text-white text-2xl font-bold mb-4">Choisir l&apos;age</h2>
                <div className="px-4 py-1 rounded-md text-white font-bold mb-4 border border-red-600">{age} ANS</div>
                <input
                  type="range"
                  min={18}
                  max={39}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between w-full text-sm font-bold text-gray-400 mt-2">
                  <span>18</span>
                  <span>39+</span>
                </div>
              </div>
              <button
                onClick={handleAuFeelingNext}
                disabled={selectedEthnicities.length === 0}
                className={`px-12 py-3 rounded-xl font-bold text-white mt-10 ${selectedEthnicities.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                SUIVANT
              </button>
            </div>
          )}

          {/* MES IA TAB */}
          {activeTab === 'mes-ia' && (
            <div className="p-4">
              {loadingModels ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-xl text-gray-400">Chargement de vos modeles IA...</p>
                </div>
              ) : userAIModels.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {userAIModels.map((model) => (
                    <div
                      key={model.id}
                      className="relative w-55 h-66 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                      onClick={() => handleSelectAIModel(model)}
                    >
                      {model.avatar_url ? (
                        <Image src={model.avatar_url} alt={model.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-purple-600/30" />
                      )}
                      <div className="absolute bottom-0 left-0 w-full p-3" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)' }}>
                        <span className="text-white font-semibold text-lg">{model.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-xl text-gray-400 mb-4">Vous n&apos;avez pas encore cree de modele IA.</p>
                  <Link href="/creer-modele" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                    Creer une nouvelle IA
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

