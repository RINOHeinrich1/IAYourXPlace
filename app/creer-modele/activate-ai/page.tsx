// app/creer-modele/activate-ai/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ActivateAiPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  const handlePay = () => {
    console.log('Traitement du paiement...');
    alert('Paiement en cours...');
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/bgimage2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay flou derrière tout */}
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitBackdropFilter: 'blur(15px)',
          backdropFilter: 'blur(15px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
        }}
      ></div>

      {/* Bouton fermer */}
      <button
        onClick={handleCancel}
        className="absolute top-6 right-6 z-10 w-[90px] h-[90px] flex items-center justify-center"
      >
        <Image src="/icons/close.png" alt="close" width={70} height={70} />
      </button>

      {/* Carte centrale */}
      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-[32px] shadow-xl"
        style={{
          width: '409px',
          height: '434px',
          background: 'rgba(22,22,22,1)',
          padding: '40px 20px',
        }}
      >
        <h2 className="text-white text-xl font-bold text-center">
          Processus de paiement
        </h2>
      </div>

      {/* Boutons sous la carte */}
      <div className="flex space-x-4 mt-10 z-10">
        <button
          onClick={handleCancel}
          className="w-[150px] h-[50px] bg-gray-600 rounded-xl text-white font-semibold hover:bg-gray-700 transition"
        >
          Annuler
        </button>
        <button
          onClick={handlePay}
          className="w-[150px] h-[50px] bg-red-600 rounded-xl text-white font-semibold hover:bg-red-700 transition"
        >
          Payer
        </button>
      </div>
    </div>
  );
}
