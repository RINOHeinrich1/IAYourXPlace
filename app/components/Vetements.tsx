'use client';
import React from 'react';
import Image from 'next/image';

const vetementsImages = [
  { id: 1, src: '/images/generer1.jpg', label: 'Bikini' },
  { id: 2, src: '/images/generer1.jpg', label: 'Jupe' },
  { id: 3, src: '/images/generer1.jpg', label: 'Lingerie' },
  { id: 4, src: '/images/generer1.jpg', label: 'Haut court' },
  { id: 5, src: '/images/generer1.jpg', label: 'Cuir' },
];

interface Props {
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  onSave?: (ids: number[]) => Promise<void>; // ✅ Ajouté
}

export default function Vetements({ selectedIds, toggleSelect, onSave }: Props) {
  const handleClick = async (id: number) => {
    toggleSelect(id);

    // Génère le nouveau tableau des IDs sélectionnés
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];

    // Appelle la fonction onSave si elle existe
    if (onSave) {
      await onSave(newIds);
    }
  };

  return (
    <div className="flex gap-0 mb-10 justify-between flex-wrap">
      {vetementsImages.map((img) => (
        <div key={img.id} className="relative flex flex-col items-center cursor-pointer group">
          <div className="w-48 h-48 relative">
            <Image
              src={img.src}
              alt={img.label}
              width={150}
              height={150}
              className="object-cover rounded-2xl"
            />

            {/* Icone plus qui apparaît au hover */}
            {!selectedIds.includes(img.id) && (
              <div className="absolute top-13 left-15 opacity-0 group-hover:opacity-100 transition-opacity">
                <Image src="/icons/plus.png" alt="Ajouter" width={40} height={40} />
              </div>
            )}

            {/* Icone check si sélectionné */}
            {selectedIds.includes(img.id) && (
              <div className="absolute inset-0 flex items-start justify-center mt-9 mr-5">
                <Image src="/icons/check.png" alt="Sélectionné" width={47} height={47} />
              </div>
            )}

            {/* Overlay pour détecter le clic */}
            <div
              className="absolute inset-0"
              onClick={() => handleClick(img.id)} // ✅ On utilise handleClick
            ></div>
          </div>
          <span className="text-gray-300 font-semibold text-sm -ml-11 -mt-6">{img.label}</span>
        </div>
      ))}
    </div>
  );
}
