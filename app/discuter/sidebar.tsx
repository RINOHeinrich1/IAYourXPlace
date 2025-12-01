'use client';

import Image from 'next/image';
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
  { name: 'Discuter', active: true, iconPath: '/images/iconmes.png' },
  { name: 'Collection', active: true, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png' },
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

// --- Composant LargeImagePlaceholder ---
export const LargeImagePlaceholder = ({ alignTop = false }: { alignTop?: boolean }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const nextImage = () => {
    if (currentImageIndex < placeholderImages.length - 1) setCurrentImageIndex(prev => prev + 1);
  };

  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
  };

  const currentImage = placeholderImages[currentImageIndex];

  const outerClass = `w-[400px] bg-black/50 p-0 transition-all duration-300 z-20 self-start ${
    alignTop ? 'mt-0' : 'mt-6'
  }`;

  const innerImgClass = alignTop
    ? 'relative w-[95%] h-[390px] ml-0 mt-0'
    : 'relative w-[95%] h-[390px] -ml-8 mt-16';

  const handleRedirect = () => {
    router.push(`/generation?img=${encodeURIComponent(currentImage.src || '/images/imgmes2.jpg')}&name=${encodeURIComponent(currentImage.name)}`);
  };

  return (
    <div className={outerClass}>
      <div className="w-full rounded-3xl flex flex-col relative overflow-hidden">
        {/* Conteneur Image ou gradient */}
        <div className="relative w-full flex-none flex items-start justify-center">
          <div className={innerImgClass} style={{
            background: currentImageIndex === 2 ? 'radial-gradient(74.76% 74.76% at 26.01% 25.24%, #D91A2A 0%, #202020 100%)' : undefined,
            borderRadius: '1.5rem',
          }}>
            {/* Image pour les 2 premières cartes */}
           {/* Image pour la première image uniquement */}
{/* Première image simple */}
{currentImageIndex === 0 && (
  <Image
    src={currentImage.src}
    alt={currentImage.alt}
    fill
    className="object-cover rounded-3xl transition-opacity duration-500 cursor-pointer"
    onClick={handleRedirect}
  />
)}

{/* Deuxième image avec icône Play */}
{currentImageIndex === 1 && (
  <>
    <Image
      src={currentImage.src}
      alt={currentImage.alt}
      fill
      className="object-cover rounded-3xl transition-opacity duration-500 cursor-pointer"
      onClick={handleRedirect}
    />
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto">
      <button
        className="w-16 h-16 flex items-center justify-center  rounded-full hover:bg-black/70 transition"
        // onClick={handleRedirect}
      >
        <Image src="/icons/rounded_play.png" alt="Play Video" width={40} height={40} />
      </button>
    </div>
  </>
)}


            {/* Grand bouton + pour la troisième carte */}
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
            {currentImageIndex < placeholderImages.length - 1 && (
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
          <h2 className="text-white text-3xl font-bold mb-3">Elizabeth Garcia</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Katarina Sommerfeld est une étudiante en médecine allemande connue pour son charme et son sourire. Sociable et intelligente, c'est le centre d'attention de toutes les fêtes, surtout quand il y a de la bière ! Katarina aime rencontrer du monde et essaie toujours de laisser une impression durable.
          </p>
          <span className="text-gray-400 text-sm block mb-4">À propos de moi:</span>
          <div className="flex justify-between w-full mb-4">
            <InfoItem label="Age" value="23 ans" />
            <InfoItem label="Corps" value="Mince" />
            <InfoItem label="Relation" value="Célibataire" />
          </div>
          <div className="flex justify-between w-full">
            <InfoItem label="Ethnicité" value="Asiatique" />
            <InfoItem label="Profession" value="Étudiante" />
            <InfoItem label="Personnalité" value="Soumise" />
            <InfoItem label="Kinks" value="Flirt timide" />
          </div>
        </div>
      </div>
    </div>
  );
};
