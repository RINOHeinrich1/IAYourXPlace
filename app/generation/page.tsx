'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Accessoires from '../components/Accessoires';
import Vetements from '../components/Vetements';
import Actions from '../components/Actions';
import Poses from '../components/Poses';
import Scenes from '../components/Scenes';
import { supabase } from '../../lib/supabaseClient';

// Sidebar Items
const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = { name: 'Revenir dans myXplace', iconPath: '/icons/back_arrow.png', href: '/' };

// Sidebar Component
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

// Main Page
export default function GenerationPage() {
  const searchParams = useSearchParams();
  const imgSrc = searchParams.get('img');
  const imgName = searchParams.get('name');

  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);
const [activeCategory, setActiveCategory] = useState('Vetements');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);



  const topLinks = [
    { id: 1, title: 'Vetements' },
    { id: 2, title: 'Actions' },
    { id: 3, title: 'Poses' },
    { id: 4, title: 'Accessoires' },
    { id: 5, title: 'Scenes' },
  ];

  const bottomImages = [
    { id: 1, src: '/images/generer1.jpg', label: 'Entraînement' },
    { id: 2, src: '/images/generer2.jpg', label: 'Bronzage' },
    { id: 3, src: '/images/generer3.jpg', label: 'Repas' },
    { id: 4, src: '/images/generer4.jpg', label: 'Marche' },
    { id: 5, src: '/images/generer5.jpg', label: 'Relax' },
  ];

  const smallCards = [
    { id: 1, icon: '/icons/icon.png', value: 1 },
    { id: 2, icon: '/icons/carer.png', value: 4 },
    { id: 3, icon: '/icons/icon.png', value: 16 },
    { id: 4, icon: '/icons/icon.png', value: 32 },
    { id: 5, icon: '/icons/icon.png', value: 64 },
  ];

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClickGenerate = () => setHasGeneratedImage(true);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen relative">
        {/* User Icon */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
            <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
          </div>
        </div>

        {/* Titre Générateur + Image/Vidéo */}
        <div className="flex items-center gap-22 mb-8">
          <h1 className="text-3xl font-bold font-montserrat">Générateur</h1>
          {!hasGeneratedImage && (
            <div className="flex gap-11">
              <button onClick={() => setMode('image')} className="relative text-sm font-medium group focus:outline-none">
                Image
                <span className={`absolute left-0 -bottom-1 w-full h-[2px] ${mode === 'image' ? 'bg-red-600' : 'bg-transparent'} transition-colors`} />
              </button>
              <button onClick={() => setMode('video')} className="relative text-sm font-medium group focus:outline-none">
                Vidéo
                <span className={`absolute left-0 -bottom-1 w-full h-[2px] ${mode === 'video' ? 'bg-red-600' : 'bg-transparent'} transition-colors`} />
              </button>
            </div>
          )}
        </div>

        {/* Image principale + textarea + résultats générés */}
        <div className={`flex gap-6 ${hasGeneratedImage ? 'mb-4 items-start' : 'mb-10'}`}>
          {imgSrc && (
            <div className="rounded-3xl overflow-hidden relative w-1/3">
              <Image src={imgSrc} alt={imgName || ''} width={400} height={400} className="object-cover rounded-3xl" />
              <div
                className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-start p-4"
                style={{ background: 'linear-gradient(180.83deg, rgba(0, 0, 0, 0.087) -8.53%, rgba(0, 0, 0, 0.58) 99.29%)' }}
              >
                <span className="text-white text-3xl font-bold font-montserrat font-medium">Mila nowak</span>
              </div>
            </div>
          )}

          <div className={`relative flex flex-col ${hasGeneratedImage ? 'w-1/3' : 'w-2/3'}`}>
            <textarea className={`p-4 pt-10 pl-12 rounded-4xl bg-white/10 text-white resize-none ${hasGeneratedImage ? 'w-full h-[317px]' : 'w-160 h-[311px]'}`} />
            <div className="absolute top-6 left-6 pointer-events-none">
              <Image src="/icons/edit.png" alt="Icône" width={29} height={28} style={{ filter: "brightness(0) saturate(100%) invert(58%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(88%)" }} />
            </div>
          </div>

          {hasGeneratedImage && (
            <div className="w-1/3 flex flex-col items-start">
              <h3 className="text-white text-xl font-bold mb-2">{mode === 'image' ? 'Images Générées' : 'Vidéos Générées'}</h3>
              <Link href="/generer/details-mock-video" className="rounded-3xl overflow-hidden relative block cursor-pointer" style={{ width: 240, height: 290 }}>
                {mode === 'image' ? (
                  <Image src="/images/mock.png" alt="Image générée" layout="fill" objectFit="cover" className="rounded-3xl" />
                ) : (
                  <>
                    <video src="/videos/mock.mp4" width="100%" height="100%" controls={false} loop muted className="object-cover rounded-3xl">
                      Votre navigateur ne supporte pas la balise vidéo.
                    </video>
                    <div className="absolute inset-0 flex justify-center items-center z-10">
                      <div className="w-16 h-16 flex justify-center items-center">
                        <img src="/icons/playimage.png" alt="Play Icon" className="w-10 h-10" />
                      </div>
                    </div>
                  </>
                )}
              </Link>
              <p className="text-gray-400 text-sm mt-2">Ici, vous pouvez trouver vos {mode === 'image' ? 'images' : 'vidéos'}.</p>
            </div>
          )}
        </div>

        {/* Top Links pour catégories */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-white font-bold text-3xl">Actions</h2>
          <div className="flex gap-11 mr-84">
            {topLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveCategory(link.title)}
                className={`relative text-sm font-medium ${activeCategory === link.title ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {link.title}
                <span className={`absolute left-0 -bottom-1 h-[2px] transition-all duration-300 ${activeCategory === link.title ? 'w-full bg-red-600' : 'w-0 group-hover:w-full bg-gray-600'}`}></span>
              </button>
            ))}
          </div>
        </div>

<div>
  {activeCategory === 'Vetements' && (
    <Vetements
      selectedIds={selectedIds}
      toggleSelect={toggleSelect}
      onSave={async (ids: number[]) => {
        const { data, error } = await supabase
          .from('vetements_selection')
          .insert(ids.map((id) => ({ vetement_id: id })));
        if (error) console.error('Erreur Supabase Vetements:', error);
        else console.log('Vetements enregistrés:', data);
      }}
    />
  )}

  {activeCategory === 'Actions' && (
    <Actions
      selectedIds={selectedIds}
      toggleSelect={toggleSelect}
      onSave={async (ids: number[]) => {
        const { data, error } = await supabase
          .from('actions_selection')
          .insert(ids.map((id) => ({ action_id: id })));
        if (error) console.error('Erreur Supabase Actions:', error);
        else console.log('Actions enregistrées:', data);
      }}
    />
  )}

  {activeCategory === 'Poses' && (
    <Poses
      selectedIds={selectedIds}
      toggleSelect={toggleSelect}
      onSave={async (ids: number[]) => {
        const { data, error } = await supabase
          .from('poses_selection')
          .insert(ids.map((id) => ({ pose_id: id })));
        if (error) console.error('Erreur Supabase Poses:', error);
        else console.log('Poses enregistrées:', data);
      }}
    />
  )}

  {activeCategory === 'Accessoires' && (
    <Accessoires
      selectedIds={selectedIds}
      toggleSelect={toggleSelect}
      onSave={async (ids: number[]) => {
        const { data, error } = await supabase
          .from('accessoires_selection')
          .insert(ids.map((id) => ({ accessoire_id: id })));
        if (error) console.error('Erreur Supabase Accessoires:', error);
        else console.log('Accessoires enregistrés:', data);
      }}
    />
  )}

  {activeCategory === 'Scenes' && (
    <Scenes
      selectedIds={selectedIds}
      toggleSelect={toggleSelect}
      onSave={async (ids: number[]) => {
        const { data, error } = await supabase
          .from('scenes_selection')
          .insert(ids.map((id) => ({ scene_id: id })));
        if (error) console.error('Erreur Supabase Scenes:', error);
        else console.log('Scenes enregistrées:', data);
      }}
    />
  )}
</div>
        {/* Nombre d'images */}
        {mode === 'image' && (
          <>
            <h2 className="text-white font-bold text-2xl mb-6">Nombre d'images</h2>
            <div className="flex gap-4 mb-8">
              {smallCards.map((card, index) => (
                <div key={card.id} className={`flex items-center gap-2 w-[82px] h-[43px] rounded-xl p-2 justify-center ${index === 0 ? 'bg-red-600' : 'bg-[rgba(87,87,87,1)]'}`}>
                  <Image src={card.icon} alt="icon" width={17} height={11} />
                  <span className="text-white font-bold">{card.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bouton Générer */}
        <div className="flex justify-center mb-10">
          <button onClick={handleClickGenerate} className="bg-red-600 hover:bg-red-700 text-white w-full py-4 rounded-2xl font-bold transition">
            Générer {mode === 'video' ? 'une Vidéo' : 'une Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
