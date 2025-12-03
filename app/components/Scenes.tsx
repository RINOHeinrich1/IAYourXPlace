'use client';
import React from 'react';
import Image from 'next/image';

export const scenesImages = [
  { id: 1, src: '/images/generer1.jpg', label: 'Jardin' },
  { id: 2, src: '/images/generer1.jpg', label: 'Page' },
  { id: 3, src: '/images/generer1.jpg', label: 'Chambre' },
  { id: 4, src: '/images/generer1.jpg', label: 'Cuisine' },
];

interface Props {
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  onSave?: (labels: string[]) => Promise<void>; // 🔹 labels au lieu de ids
}

export default function Scenes({ selectedIds, toggleSelect, onSave }: Props) {
  const handleClick = async (id: number) => {
    // Met à jour la sélection
    toggleSelect(id);

    // Nouveau tableau des IDs sélectionnés
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];

    // Nouveau tableau des labels sélectionnés
    const selectedLabels = scenesImages
      .filter(img => newIds.includes(img.id))
      .map(img => img.label);

    // Appelle la fonction onSave si elle existe
    if (onSave) {
      await onSave(selectedLabels);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-10 justify-start">
      {scenesImages.map(img => (
        <div key={img.id} className="relative flex flex-col items-center cursor-pointer group">
          <div className="w-48 h-48 relative">
            <Image
              src={img.src}
              alt={img.label}
              width={150}
              height={150}
              className="object-cover rounded-2xl"
            />

            {/* Icone plus au hover */}
            {!selectedIds.includes(img.id) && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Image src="/icons/plus.png" alt="Ajouter" width={40} height={40} />
              </div>
            )}

            {/* Icone check si sélectionné */}
            {selectedIds.includes(img.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/icons/check.png" alt="Sélectionné" width={47} height={47} />
              </div>
            )}

            {/* Overlay pour le clic */}
            <div className="absolute inset-0" onClick={() => handleClick(img.id)}></div>
          </div>

          <span className="text-gray-300 font-semibold text-sm mt-2">{img.label}</span>
        </div>
      ))}
    </div>
  );
}
