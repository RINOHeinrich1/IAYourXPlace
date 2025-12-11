'use client';

import Image from 'next/image';
import AIImage from '../components/AIImage';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Données du carrousel ---
const placeholderImages = [
  { src: '/images/imgmes1.png', alt: 'Elizabeth Garcia - Image 1', name: 'Image 1' },
  { src: '/images/imgmes2.jpg', alt: 'Elizabeth Garcia - Image 2', name: 'Image 2' },
  { src: '', alt: 'Special Card - Image 3', name: 'Special Card' }, // Troisième carte sans image
];

// --- Composant InfoItem ---
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="flex flex-col items-start w-1/3 min-w-[70px]">
    <span className="text-xs text-gray-400 mb-1">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

// --- Navigation Items ---
export const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: true, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

export const backItem = {
  name: 'Revenir dans myXplace',
  iconPath: '/icons/back_arrow.png',
  href: '/',
};

// --- Composant Sidebar ---
export const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const sidebarWidthClass = isCollapsed ? 'w-[80px]' : 'w-[299px]';
  const itemPaddingClass = isCollapsed ? 'px-0 justify-center' : 'px-6 space-x-3';

  const logoContent = isCollapsed ? (
    <Image src="/icons/close.png" alt="X" width={40} height={40} className="mx-auto" />
  ) : (
    <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
  );

  useEffect(() => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.overflowY = 'auto';
  }, []);

  return (
    <div
      id="sidebar"
      className={`${sidebarWidthClass} fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50 transition-all duration-300`}
    >
      <div className="mb-10 mt-2">{logoContent}</div>
      <nav className="space-y-3">
        {aiNavItems.map((item) => {
          const classes = `flex items-center py-2 rounded-lg cursor-pointer transition-colors duration-300
            ${itemPaddingClass} ${item.active ? '' : 'text-gray-400 hover:text-white'}`;
          const itemContent = (
            <>
              <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </>
          );
          if (item.href) return <Link key={item.name} href={item.href} className={classes}>{itemContent}</Link>;
          return <div key={item.name} className={classes}>{itemContent}</div>;
        })}
        <div className="pt-6">
          <Link
            href={backItem.href}
            className={`w-full flex items-center py-2 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600 ${itemPaddingClass}`}
          >
            <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
            {!isCollapsed && <span>{backItem.name}</span>}
          </Link>
        </div>
      </nav>
    </div>
  );
};

// Character data for sidebar display
interface CharacterInfo {
  name: string;
  avatar_url?: string;
  description?: string;
  personality?: string;
  age?: number;
  body_type?: string;
  relationship?: string[];
  ethnicities?: string[];
  profession?: string[];
}

// --- Composant LargeImagePlaceholder ---
export const LargeImagePlaceholder = ({
  alignTop = false,
  character
}: {
  alignTop?: boolean;
  character?: CharacterInfo;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Build images array: character avatar + placeholder options
  const characterAvatar = character?.avatar_url || '/images/default-avatar.png';
  const dynamicImages = [
    { src: characterAvatar, alt: `${character?.name || 'AI'} - Image 1`, name: 'Image 1' },
    { src: characterAvatar, alt: `${character?.name || 'AI'} - Image 2`, name: 'Image 2' },
    { src: '', alt: 'Generate New - Image 3', name: 'Generate New' },
  ];

  const nextImage = () => {
    if (currentImageIndex < dynamicImages.length - 1) setCurrentImageIndex(prev => prev + 1);
  };

  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
  };

  const currentImage = dynamicImages[currentImageIndex];

  const outerClass = `w-[400px] bg-black/50 p-0 transition-all duration-300 z-20 self-start ${
    alignTop ? 'mt-0' : 'mt-6'
  }`;

  const innerImgClass = alignTop
    ? 'relative w-[95%] h-[390px] ml-0 mt-0'
    : 'relative w-[95%] h-[390px] -ml-8 mt-16';

  const handleRedirect = () => {
    router.push(`/generation?img=${encodeURIComponent(currentImage.src || characterAvatar)}&name=${encodeURIComponent(character?.name || 'AI')}`);
  };

  // Character info with fallbacks
  const charName = character?.name || 'AI Character';
  const charDescription = character?.description || character?.personality || 'An AI companion ready to chat with you.';
  const charAge = character?.age ? `${character.age} ans` : 'N/A';
  const charBody = character?.body_type || 'N/A';
  const charRelation = character?.relationship?.[0] || 'N/A';
  const charEthnicity = character?.ethnicities?.[0] || 'N/A';
  const charProfession = character?.profession?.[0] || 'N/A';
  const charPersonality = character?.personality?.substring(0, 20) || 'N/A';

  return (
    <div className={outerClass}>
      <div className="w-full rounded-3xl flex flex-col relative overflow-hidden">
        {/* Conteneur Image ou gradient */}
        <div className="relative w-full flex-none flex items-start justify-center">
          <div className={innerImgClass} style={{
            background: currentImageIndex === 2 ? 'radial-gradient(74.76% 74.76% at 26.01% 25.24%, #D91A2A 0%, #202020 100%)' : undefined,
            borderRadius: '1.5rem',
          }}>
            {/* First and second images */}
            {(currentImageIndex === 0 || currentImageIndex === 1) && currentImage.src && (
              <>
                <AIImage
                  src={currentImage.src}
                  alt={currentImage.alt}
                  fill
                  className="object-cover rounded-3xl transition-opacity duration-500 cursor-pointer"
                  onClick={handleRedirect}
                />
                {currentImageIndex === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto">
                    <button className="w-16 h-16 flex items-center justify-center rounded-full hover:bg-black/70 transition">
                      <Image src="/icons/rounded_play.png" alt="Play Video" width={40} height={40} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Third card - generate new */}
            {currentImageIndex === 2 && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto">
                <button
                  onClick={handleRedirect}
                  className="w-28 h-28 flex items-center justify-center rounded-full transition"
                >
                  <Image src="/icons/plus.png" alt="Plus" width={100} height={100} />
                </button>
              </div>
            )}

            {/* Bouton Previous */}
            {currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 z-20 cursor-pointer"
                style={{ outline: 'none' }}
              >
                <Image src="/icons/prev-arrow.png" alt="Previous" width={26} height={26} />
              </button>
            )}

            {/* Bouton Next */}
            {currentImageIndex < dynamicImages.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 z-20 cursor-pointer"
                style={{ outline: 'none' }}
              >
                <Image src="/icons/next-arrow.png" alt="Next" width={40} height={40} />
              </button>
            )}
          </div>
        </div>

        {/* Contenu texte et infos */}
        <div className="p-6 bg-black rounded-b-3xl w-full">
          <h2 className="text-white text-3xl font-bold mb-3">{charName}</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-4">
            {charDescription}
          </p>
          <span className="text-gray-400 text-sm block mb-4">À propos de moi:</span>
          <div className="flex justify-between w-full mb-4">
            <InfoItem label="Age" value={charAge} />
            <InfoItem label="Corps" value={charBody} />
            <InfoItem label="Relation" value={charRelation} />
          </div>
          <div className="flex justify-between w-full">
            <InfoItem label="Ethnicité" value={charEthnicity} />
            <InfoItem label="Profession" value={charProfession} />
            <InfoItem label="Personnalité" value={charPersonality} />
          </div>
        </div>
      </div>
    </div>
  );
};
