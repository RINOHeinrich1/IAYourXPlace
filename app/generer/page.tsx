'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from "react";

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' },
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
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${isActive ? ' font-semibold' : 'text-gray-400 hover:text-white'
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

interface ImageItem {
  id: number;
  name: string;
  src: string;
}

export default function GenererPage() {
  const posts = [
    { id: 1, title: 'Post' },
    { id: 2, title: 'Au feeling' },
    { id: 3, title: 'Mes IA' },
  ];

  const images: ImageItem[] = [
    { id: 1, name: 'Mila nowak', src: '/images/generer1.jpg' },
    { id: 2, name: 'Bessie', src: '/images/generer2.jpg' },
    { id: 3, name: 'Aurora', src: '/images/generer3.jpg' },
    { id: 4, name: 'Luna', src: '/images/generer4.jpg' },
    { id: 5, name: 'Mila', src: '/images/generer5.jpg' },
    { id: 6, name: 'Nova', src: '/images/genener6.jpg' },
    { id: 7, name: 'Iris', src: '/images/generer7.jpg' },
    { id: 8, name: 'Violet', src: '/images/generer8.jpg' },
  ];

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const router = useRouter();

  // Conserver la sélection dans localStorage
  const handleSelectAndGo = (img: ImageItem) => {
    localStorage.setItem('selectedCharacter', JSON.stringify(img));
    router.push('/generation'); // Redirection vers la page finale
  };

  const closePopup = () => setSelectedImage(null);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen relative">
        <div className="absolute top-4 right-4">
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white mt-3 bg-white/10 mr-8">
            <Image src={'/images/iconuser.png'} alt="User Icon" width={20} height={20} />
          </div>
        </div>

        <h1 className="font-montserrat text-3xl font-bold mb-2 mt-22">Générateur d'Images et vidéos</h1>
        <h2 className="text-white font-bold mb-6">Choisir un personnage</h2>

        {/* Petits liens */}
        <div className="flex space-x-4 mb-15 mt-11">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href="#"
              className={`relative pb-1 text-sm font-medium ${index === 0 ? 'text-white font-bold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-red-600' : 'text-gray-500 hover:text-white'}`}
            >
              {post.title}
            </Link>
          ))}
        </div>

        <div className="p-10 bg-black min-h-screen text-white">
          {/* Grille d’images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-9">
            {images.map((img) => (
              <div key={img.id} className="relative w-55 h-66 rounded-5xl overflow-hidden cursor-pointer" onClick={() => setSelectedImage(img)}>
                <Image src={img.src} alt={img.name} fill className="object-cover rounded-4xl" />
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[170px] text-center py-2 rounded-3xl"
                  style={{ background: 'linear-gradient(199deg, rgba(255,255,255,0.25) 88%, rgba(255,255,255,0.1) 190%)' }}
                >
                  <span className="text-white font-semibold text-sm">{img.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Popup */}
          {selectedImage && (
            <div
              className="fixed bottom-0 ml-38 left-1/2 -translate-x-1/2 w-[1027px] h-[346px] rounded-t-[32px] backdrop-blur-[40px] p-6 z-50"
              style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)' }}
            >
              <div className="flex flex-col -mt-22 items-center justify-center h-full relative">
                {/* Conserver et passer à la génération */}
                <button
                  onClick={() => selectedImage && handleSelectAndGo(selectedImage)}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Sélectionner
                </button>

                <button onClick={closePopup} className="absolute top-4 right-4 text-white text-xl font-bold">✕</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
