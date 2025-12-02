'use client';

import Image from "next/image";
import { useState } from "react";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'photos' | 'videos'>('text');

  const gallery = {
    text: [
      "/images/imagevideo.png",
      "/images/B.jpg",
      "/images/C.png",
      "/images/D.jpg",
      "/images/E.jpg",
      "/images/F.jpg",
    ],
    photos: [
      "/images/D.jpg",
      "/images/E.jpg",
      "/images/F.jpg",
      "/images/colection3.png"
    ],
    videos: [
      "/images/A.jpg",
      "/images/colection3.png",
      "/images/imagevideo.png",
    ]
  };

  const currentGallery = gallery[activeTab];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="flex-1 overflow-auto p-6">

        <div className="flex justify-center gap-10 mb-6 text-2xl">
          <button onClick={() => setActiveTab('text')} className="flex flex-col cursor-pointer items-center pb-2 px-2 transition-all">
            <Image
              src={activeTab === 'text' ? "/icons/stack.png" : "/icons/stack_grey.png"}
              alt="Text"
              width={35}
              height={35}
            />
            {activeTab === 'text' && <div className="w-full h-1 bg-red-600 mt-1 rounded-full" />}
          </button>

          <button onClick={() => setActiveTab('photos')} className="flex flex-col cursor-pointer items-center pb-2 px-2 transition-all">
            <Image
              src={activeTab === 'photos' ? "/icons/icon.png" : "/icons/icon.png"}
              alt="Photos"
              width={35}
              height={35}
            />
            {activeTab === 'photos' && <div className="w-full h-1 bg-red-600 mt-1 rounded-full" />}
          </button>

          <button onClick={() => setActiveTab('videos')} className="flex flex-col cursor-pointer items-center pb-2 px-2 transition-all">
            <Image
              src={activeTab === 'videos' ? "/icons/playlist.png" : "/icons/playlist_grey.png"}
              alt="Videos"
              width={35}
              height={35}
            />
            {activeTab === 'videos' && <div className="w-full h-1 bg-red-600 mt-1 rounded-full" />}
          </button>
        </div>

        {/* Galerie / Contenu */}
       <div className={`grid 
  ${activeTab === 'videos' ? 'grid-cols-1 gap-y-6 justify-items-center' 
    : activeTab === 'text' ? 'grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center' 
    : 'grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6 justify-items-center'} 
  px-6
`}>

          {currentGallery.map((img, index) => (
            <div
              key={index}
              className={`relative 
                ${activeTab === 'videos' ? 'w-2/3 h-96' 
                  : activeTab === 'text' ? 'w-11/12 sm:w-full h-72 sm:h-80' 
                  : 'w-10/12 sm:w-5/6 h-96'} 
                rounded-xl overflow-hidden group
              `}
            >
              <Image
                src={img}
                alt={`Gallery ${index}`}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-xl group-hover:scale-105 transition-transform duration-300"
              />

              {/* Icône Play pour vidéos ou première image de l'onglet text */}
              {(activeTab === 'videos' || (activeTab === 'text' && index === 0)) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/icons/playimage.png" alt="Play" width={60} height={60} />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
