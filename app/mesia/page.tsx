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

interface Profile {
  id: number;
  name: string;
  age: number;
  ethnicities: string[];
  hair_type: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  chest_size: string;
  personality: string[];
  relationship: string[];
  profession: string[];
  sexual_preferences: string[];
  voice: string;
  imagePath?: string;
  created_at: string;
}

export default function MesIA() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from<Profile>('profiles').select('*').order('created_at', { ascending: false });
      if (error) console.error('Erreur Supabase:', error);
      else if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const generateDescription = (profile: Profile) => {
    // Création automatique d'une phrase à partir des champs
    return `${profile.name}, ${profile.age} ans, ${profile.ethnicities.join(', ')}. 
    Elle a les cheveux ${profile.hair_type} de couleur ${profile.hair_color} et des yeux ${profile.eye_color}. 
    Son corps est ${profile.body_type} avec une poitrine ${profile.chest_size}. 
    Elle est ${profile.personality.join(', ')} et intéressée par ${profile.sexual_preferences.join(', ')}. 
    Profession(s): ${profile.profession.join(', ')}. Relation(s) actuelle(s): ${profile.relationship.join(', ')}. 
    Voix: ${profile.voice}.`;
  };

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
          {profiles.map((profile) => (
            <div key={profile.id} className="relative w-64 h-72 bg-white rounded-2xl overflow-hidden shadow-2xl">
              {profile.imagePath && (
                <Image
                  src={profile.imagePath}
                  alt={profile.name}
                  layout="fill"
                  objectFit="cover"
                  className="absolute z-0"
                  style={{ filter: 'brightness(0.95)' }}
                />
              )}

              <div className="absolute top-4 right-4 z-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                <Image src="/icons/chat.png" alt="Discuter" width={38} height={18} />
              </div>

              <div
                className="absolute bottom-0 left-0 w-full p-3 z-10"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)' }}
              >
                <h2 className="text-white text-lg font-bold mb-1">{profile.name}</h2>
                <p className="text-gray-200 text-sm mb-1">{profile.age} ans</p>
                <p className="text-white text-xs leading-snug">{generateDescription(profile)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
