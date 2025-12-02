'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';


const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: true, iconPath: '/images/mesia.png', href: '/mesia' },
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
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${
          isActive ? ' font-semibold' : 'text-gray-400 hover:text-white'
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

interface AIModel {
  id: string;
  name: string;
  age: number;
  gender: string;
  ethnicities: string[];
  hair_type: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  chest_size: string;
  personality: string;
  relationship: string[];
  profession: string[];
  sexual_preferences: string[];
  voice: string;
  avatar_url?: string;
  created_at: string;
  created_by: string;
  status: string;
}

export default function MesIA() {
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIModels = async () => {
      setLoading(true);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Erreur d\'authentification:', authError);
        setLoading(false);
        return;
      }

      // Fetch AI models created by the current user
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
      } else if (data) {
        setAiModels(data);
      }

      setLoading(false);
    };

    fetchAIModels();
  }, []);

  const generateDescription = (model: AIModel) => {
    // Helper to safely join arrays or return string
    const safeJoin = (value: string | string[] | undefined, fallback = 'N/A') => {
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'string') return value;
      return fallback;
    };

    const genderText = model.gender === 'femmes' ? 'Elle' : 'Il';
    const genderPossessive = model.gender === 'femmes' ? 'Son' : 'Son';

    return `${model.name}, ${model.age} ans, ${safeJoin(model.ethnicities)}.
    ${genderText} a les cheveux ${model.hair_type || 'N/A'} de couleur ${model.hair_color || 'N/A'} et des yeux ${model.eye_color || 'N/A'}.
    ${genderPossessive} corps est ${model.body_type || 'N/A'}.
    ${genderText} est ${safeJoin(model.personality)}.
    Profession(s): ${safeJoin(model.profession)}. Relation(s): ${safeJoin(model.relationship)}.`;
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen flex items-center justify-center">
          <p className="text-xl">Chargement de vos modèles IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-white text-4xl font-extrabold tracking-wide">
            Mes <span className="text-red-600">IA</span>
          </h1>
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
            <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
          </div>
        </div>

        <div className="flex gap-4 mt-16 flex-wrap justify-start">
          {/* Créer nouvelle IA */}
          <Link href="/creer-modele" className="block">
            <div className="w-64 h-72 bg-red-600 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-red-700 transition-colors shadow-2xl">
              <div className="mb-4">
                <Image src="/icons/plus.png" alt="Créer IA" width={38} height={18} />
              </div>
              <span className="text-white text-xl font-bold mt-4">Créer une nouvelle IA</span>
            </div>
          </Link>

          {/* Affichage IA depuis Supabase */}
          {aiModels.map((model) => (
            <Link href={`/discuter?modelId=${model.id}`} key={model.id} className="block">
              <div className="relative w-64 h-72 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:ring-2 hover:ring-red-500 transition-all">
                {model.avatar_url ? (
                  <Image
                    src={model.avatar_url}
                    alt={model.name}
                    fill
                    className="object-cover absolute z-0"
                    style={{ filter: 'brightness(0.95)' }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-purple-600/30 z-0" />
                )}

                <div className="absolute top-4 right-4 z-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                  <Image src="/icons/chat.png" alt="Discuter" width={38} height={18} />
                </div>

                <div
                  className="absolute bottom-0 left-0 w-full p-3 z-10"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)' }}
                >
                  <h2 className="text-white text-lg font-bold mb-1">{model.name}</h2>
                  <p className="text-gray-200 text-sm mb-1">{model.age} ans</p>
                  <p className="text-white text-xs leading-snug line-clamp-3">{generateDescription(model)}</p>
                </div>
              </div>
            </Link>
          ))}

          {/* Message si aucun modèle */}
          {aiModels.length === 0 && (
            <div className="w-full text-center py-10">
              <p className="text-gray-400 text-lg">
                Vous n&apos;avez pas encore créé de modèle IA.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Cliquez sur &quot;Créer une nouvelle IA&quot; pour commencer !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
