'use client'; 

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModelStore } from '../../store/useModelStore';

const Sidebar = () => {
  const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: true, iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
  ];

  const backItem = {
    name: 'Revenir dans myXplace',
    iconPath: '/icons/back_arrow.png',
    href: '/',
  };

  return (
    <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
      <div className="mb-10 mt-2">
        <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
      </div>
      <nav className="space-y-3">
        {aiNavItems.map((item) => (
          <Link key={item.name} href={item.href} className={`flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'}`}>
            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
            <span>{item.name}</span>
          </Link>
        ))}
        <div className="pt-6">
          <Link href={backItem.href} className="w-full flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer text-white hover:bg-red-600">
            <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
            <span>{backItem.name}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default function CreerModelePage() {
  const router = useRouter();
  const { saveStep, modelData } = useModelStore();

  const [selectedGender, setSelectedGender] = useState<'femmes' | 'hommes'>(modelData.gender || 'femmes');
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>(modelData.ethnicities || []);
  const [age, setAge] = useState<number>(modelData.age || 22);

  const ethnicOrigins = [
    { name: 'Occidental', image: '/images/origine1.png' },
    { name: 'Asiatique', image: '/images/origine2.png' },
    { name: 'Africaine', image: '/images/origine3.png' },
    { name: 'Latina', image: '/images/origine4.png' },
  ];

  const toggleEthnicity = (name: string) => {
    if (selectedEthnicities.includes(name)) {
      setSelectedEthnicities(selectedEthnicities.filter((e) => e !== name));
    } else {
      setSelectedEthnicities([...selectedEthnicities, name]);
    }
  };

  const handleNext = () => {
    saveStep({ gender: selectedGender, ethnicities: selectedEthnicities, age });
    router.push('/creer-modele/type-cheveux');
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(Number(e.target.value));
  };

  const isNextButtonEnabled = selectedEthnicities.length > 0;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen flex flex-col items-center">
        <div className="flex justify-between items-center mb-10 w-full max-w-9xl">
          <div className="flex gap-11">
            {['femmes', 'hommes'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g as 'femmes' | 'hommes')}
                className={`relative text-lg font-bold pb-2 focus:outline-none ${
                  selectedGender === g ? 'text-red-600' : 'text-gray-400 hover:text-white'
                }`}
              >
                {g === 'femmes' ? 'Femmes' : 'Hommes'}
                {selectedGender === g && <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-red-600"></span>}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
            <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
          </div>
        </div>

        <h1 className="text-[rgba(217,26,42,1)] text-4xl font-bold mb-8 w-full text-left">
          Créer ma {selectedGender === 'femmes' ? 'copine' : 'partenaire'} IA
        </h1>

        <h2 className="text-white text-2xl font-bold text-center mb-9">Choisir l'origine ethnique</h2>

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
                  layout="fill"
                  objectFit="cover"
                  className={`rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                    !isSelected ? 'opacity-50 -blur-[2px]' : ''
                  }`}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6">
                    <Image src="/icons/check.png" alt="Sélectionné" width={24} height={24} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white text-xl font-bold">{origin.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION ÂGE (AVEC PLUGIN @tailwindcss/forms) */}
        <div className="w-full max-w-md flex flex-col items-center">
            <h2 className="text-white text-2xl font-bold mb-4">Choisir l'âge</h2>
            
            <h2 className="px-4 py-1 rounded-md text-white font-bold mb-4 border border-red-600">
                {age} ans
            </h2>
            
            <input
                type="range"
                min={18}
                max={39}
                value={age}
                onChange={handleAgeChange}
                // Classes pour le plugin @tailwindcss/forms
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            
            <div className="flex justify-between w-full text-sm font-bold text-gray-400 mt-2">
                <span>18</span>
                <span>39+</span>
            </div>
        </div>
        {/* FIN SECTION ÂGE */}

        <button
          onClick={handleNext}
          disabled={!isNextButtonEnabled}
          className={`px-6 py-3 rounded-xl font-bold text-white mt-10 ${
            isNextButtonEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}