'use client';
import React from 'react';
import Image from 'next/image';

const actionsImages = [
  { id: 1, src: '/images/generer1.jpg', label: 'Entraînement' },
  { id: 2, src: '/images/generer2.jpg', label: 'Bronzage' },
  { id: 3, src: '/images/generer3.jpg', label: 'Repas' },
  { id: 4, src: '/images/generer4.jpg', label: 'Marche' },
];

interface Props {
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  onSave?: (ids: number[]) => Promise<void>; // ✅ optionnel pour Supabase
}

export default function Actions({ selectedIds, toggleSelect, onSave }: Props) {
  const handleClick = async (id: number) => {
    toggleSelect(id);

    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];

    if (onSave) {
      await onSave(newIds);
    }
  };

  return (
    <div className="flex gap-2 mb-10 justify-start flex-wrap">
      {actionsImages.map((img) => (
        <div key={img.id} className="relative flex flex-col items-center cursor-pointer group mr-2">
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
              <div className="absolute top-12 left-12 opacity-0 group-hover:opacity-100 transition-opacity">
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
              onClick={() => handleClick(img.id)}
            ></div>
          </div>
          <span className="text-gray-300 font-semibold text-sm -ml-10 -mt-6">{img.label}</span>
        </div>
      ))}
    </div>
  );
}
