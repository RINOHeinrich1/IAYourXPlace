'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Vetements, { vetementsImages } from '../components/Vetements';
import Actions, { actionsImages } from '../components/Actions';
import Poses, { posesImages } from '../components/Poses';
import Accessoires, { accessoiresImages } from '../components/Accessoires';
import Scenes, { scenesImages } from '../components/Scenes';
import { supabase } from '../../lib/supabaseClient';

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = { name: 'Revenir dans myXplace', iconPath: '/icons/back_arrow.png', href: '/' };

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>
    <nav className="space-y-3">
      {aiNavItems.map((item) => {
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${
          item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'
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
          className="w-full flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer text-white hover:bg-red-600 transition-colors"
        >
          <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
          <span>{backItem.name}</span>
        </Link>
      </div>
    </nav>
  </div>
);

interface Card {
  id: number;
  icon: string;
  value: number;
}

interface BottomImage {
  id: number;
  src: string;
  label: string;
}

function GenerationPageContent() {
  const searchParams = useSearchParams();
  const imgSrc = searchParams.get('img') || '/images/generer1.jpg';
  const imgName = searchParams.get('name') || 'Mila nowak';

  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vetements');

  const [selectedVetements, setSelectedVetements] = useState<number[]>([]);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [selectedPoses, setSelectedPoses] = useState<number[]>([]);
  const [selectedAccessoires, setSelectedAccessoires] = useState<number[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
    const [textareaContent, setTextareaContent] = useState('');

  const topLinks = ['Vetements', 'Actions', 'Poses', 'Accessoires', 'Scenes'];

  const smallCards: Card[] = [
    { id: 1, icon: '/icons/icon.png', value: 1 },
    { id: 2, icon: '/icons/carer.png', value: 4 },
    { id: 3, icon: '/icons/icon.png', value: 16 },
    { id: 4, icon: '/icons/icon.png', value: 32 },
    { id: 5, icon: '/icons/icon.png', value: 64 },
  ];

  const bottomImages: BottomImage[] = [
    { id: 1, src: '/images/generer1.jpg', label: 'Entraînement' },
    { id: 2, src: '/images/generer2.jpg', label: 'Bronzage' },
    { id: 3, src: '/images/generer3.jpg', label: 'Repas' },
    { id: 4, src: '/images/generer4.jpg', label: 'Marche' },
    { id: 5, src: '/images/generer5.jpg', label: 'Relax' },
  ];

  const toggleSelect = (setter: React.Dispatch<React.SetStateAction<number[]>>, arr: number[], id: number) => {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

   const handleGenerate = async (mode: 'image' | 'video' = 'image') => {
    setHasGeneratedImage(true);

    const vetementsLabels = selectedVetements.map(id => vetementsImages.find(img => img.id === id)?.label || '');
    const actionsLabels = selectedActions.map(id => actionsImages.find(img => img.id === id)?.label || '');
    const posesLabels = selectedPoses.map(id => posesImages.find(img => img.id === id)?.label || '');
    const accessoiresLabels = selectedAccessoires.map(id => accessoiresImages.find(img => img.id === id)?.label || '');
    const scenesLabels = selectedScenes.map(id => scenesImages.find(img => img.id === id)?.label || '');

    try {
      if (mode === 'image') {
        const generatedImageUrl = imgSrc;
        const numberOfImages = 1;

        const { data, error } = await supabase.from('image_generations').insert([
          {
            user_id: null,
            vetements_names: vetementsLabels,
            actions_names: actionsLabels,
            poses_names: posesLabels,
            accessoires_names: accessoiresLabels,
            scenes_names: scenesLabels,
            image_url: generatedImageUrl,
            image_count: numberOfImages,
            description: textareaContent, // <-- on enregistre le texte
          },
        ]);

        if (error) console.error('❌ Erreur génération image:', error);
        else console.log('✅ Image enregistrée:', data);

      } else {
        const generatedVideoUrl = "/videos/mock.mp4";

        const { data, error } = await supabase.from('video_generations').insert([
          {
            user_id: null,
            vetements_names: vetementsLabels,
            actions_names: actionsLabels,
            poses_names: posesLabels,
            accessoires_names: accessoiresLabels,
            scenes_names: scenesLabels,
            video_url: generatedVideoUrl,
            description: textareaContent, // <-- texte sauvegardé aussi pour vidéo
          },
        ]);

        if (error) console.error('❌ Erreur génération vidéo:', error);
        else console.log('✅ Vidéo enregistrée:', data);
      }
    } catch (err) {
      console.error('❌ Erreur handleGenerate:', err);
    }
  };
   

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

        {/* Titre et mode */}
        <div className="flex items-center gap-22 mb-8">
          <h1 className="text-3xl font-bold font-montserrat">Générateur</h1>
          {!hasGeneratedImage && (
            <div className="flex gap-11">
              {['image', 'video'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as 'image' | 'video')}
                  className="relative text-sm font-medium group focus:outline-none"
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                  <span
                    className={`absolute left-0 -bottom-1 w-full h-[2px] ${
                      mode === m ? 'bg-red-600' : 'bg-transparent'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Image principale + textarea + résultats */}
        <div className={`flex gap-6 ${hasGeneratedImage ? 'mb-4 items-start' : 'mb-10'}`}>
          {imgSrc && (
            <div className="rounded-3xl overflow-hidden relative w-1/3">
              <Image src={imgSrc} alt={imgName || ''} width={400} height={400} className="object-cover rounded-3xl" />
              <div
                className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-start p-4"
                style={{ background: 'linear-gradient(180.83deg, rgba(0, 0, 0, 0.087) -8.53%, rgba(0, 0, 0, 0.58) 99.29%)' }}
              >
                <span className="text-white text-3xl font-bold font-montserrat">{imgName || 'Personnage'}</span>
              </div>
            </div>
          )}

          {/* ✅ Textarea liée à l'état */}
          <div className={`relative flex flex-col ${hasGeneratedImage ? 'w-1/3' : 'w-2/3'}`}>
            <textarea
              value={textareaContent} // <-- valeur de l'état
              onChange={(e) => setTextareaContent(e.target.value)} // <-- mise à jour de l'état
              className={`p-4 pt-10 pl-12 rounded-4xl bg-white/10 text-white resize-none ${
                hasGeneratedImage ? 'w-full h-[317px]' : 'w-160 h-[311px]'
              }`}
            />
            <div className="absolute top-6 left-6 pointer-events-none">
              <Image
                src="/icons/edit.png"
                alt="Icône"
                width={29}
                height={28}
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(58%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(88%)',
                }}
              />
            </div>
          </div>

         {hasGeneratedImage && (
  <div className="w-1/3 flex flex-col items-start">
    <h3 className="text-white text-xl font-bold mb-2">
      {mode === 'image' ? 'Images Générées' : 'Vidéos Générées'}
    </h3>

    <Link
      href={mode === 'image' ? '/generer/details-mock-image' : '/generer/details-mock-video'}
      className="rounded-3xl overflow-hidden relative block cursor-pointer"
      style={{ width: 240, height: 290 }}
    >
      {mode === 'image' ? (
        <Image
          src="/images/mock.png"
          alt="Image générée"
          layout="fill"
          objectFit="cover"
          className="rounded-3xl"
        />
      ) : (
        <>
          <video
            src="/videos/mock.mp4"
            width="100%"
            height="100%"
            loop
            muted
            className="object-cover rounded-3xl"
          />
          {/* Overlay bouton play */}
          <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none">
            <div className="w-16 h-16 flex justify-center items-center">
              <img src="/icons/playimage.png" alt="Play Icon" className="w-10 h-10" />
            </div>
          </div>
        </>
      )}
    </Link>

    <p className="text-gray-400 text-sm mt-2">
      Ici, vous pouvez trouver vos {mode === 'image' ? 'images' : 'vidéos'}.
    </p>
  </div>
)}

        </div>

        {/* Top links catégories */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-white font-bold text-3xl">Actions</h2>
          <div className="flex gap-11 mr-84">
            {topLinks.map((link) => (
              <button
                key={link}
                onClick={() => setActiveCategory(link)}
                className={`relative text-sm font-medium ${activeCategory === link ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {link}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] transition-all duration-300 ${
                    activeCategory === link ? 'w-full bg-red-600' : 'w-0 group-hover:w-full bg-gray-600'
                  }`}
                ></span>
              </button>
            ))}
          </div>
        </div>

        {/* Composants dynamiques par catégorie */}
        <div>
          {activeCategory === 'Vetements' && <Vetements selectedIds={selectedVetements} toggleSelect={(id) => toggleSelect(setSelectedVetements, selectedVetements, id)} />}
          {activeCategory === 'Actions' && <Actions selectedIds={selectedActions} toggleSelect={(id) => toggleSelect(setSelectedActions, selectedActions, id)} />}
          {activeCategory === 'Poses' && <Poses selectedIds={selectedPoses} toggleSelect={(id) => toggleSelect(setSelectedPoses, selectedPoses, id)} />}
          {activeCategory === 'Accessoires' && <Accessoires selectedIds={selectedAccessoires} toggleSelect={(id) => toggleSelect(setSelectedAccessoires, selectedAccessoires, id)} />}
          {activeCategory === 'Scenes' && <Scenes selectedIds={selectedScenes} toggleSelect={(id) => toggleSelect(setSelectedScenes, selectedScenes, id)} />}
        </div>

        {/* Nombre d'images */}
        {mode === 'image' && (
          <>
            <h2 className="text-white font-bold text-2xl mb-6">Nombre d'images</h2>
            <div className="flex gap-4 mb-8">
              {smallCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`flex items-center gap-2 w-[82px] h-[43px] rounded-xl p-2 justify-center ${
                    index === 0 ? 'bg-red-600' : 'bg-[rgba(87,87,87,1)]'
                  }`}
                >
                  <Image src={card.icon} alt="icon" width={17} height={11} />
                  <span className="text-white font-bold">{card.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bouton Générer */}
        <div className="flex justify-center mb-10">
       <button onClick={() => handleGenerate(mode)}>
  Générer {mode === 'video' ? 'une Vidéo' : 'une Image'}
</button>


        </div>
      </div>
    </div>
  );
}

export default function GenerationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>}>
      <GenerationPageContent />
    </Suspense>
  );
}
