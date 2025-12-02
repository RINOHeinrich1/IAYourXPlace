// app/creer-modele/activate-ai/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useModelStore } from '../../../store/useModelStore';

export default function ActivateAiPage() {
  const router = useRouter();
  const { reset } = useModelStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const handlePay = async () => {
    setIsProcessing(true);

    // Simulate payment processing (in a real app, this would call a payment API)
    console.log('Traitement du paiement...');

    // Brief delay to show processing state
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset the model creation store since we're done
    reset();

    // Redirect to the "Mes IA" page to see the newly created AI model
    router.push('/mesia');
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
        disabled={isProcessing}
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
        <h2 className="text-white text-xl font-bold text-center mb-6">
          {isProcessing ? 'Activation en cours...' : 'Activer votre IA'}
        </h2>

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-400 text-center">
              Votre modèle IA est en cours d&apos;activation...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Confirmez-vous l&apos;activation de votre modèle IA ?
            </p>
            <p className="text-gray-400 text-sm">
              Votre IA sera disponible dans &quot;Mes IA&quot; et dans la section &quot;Discuter&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Boutons sous la carte */}
      <div className="flex space-x-4 mt-10 z-10">
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className={`w-[150px] h-[50px] rounded-xl text-white font-semibold transition
            ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'}`}
        >
          Annuler
        </button>
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className={`w-[150px] h-[50px] rounded-xl text-white font-semibold transition
            ${isProcessing ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isProcessing ? 'Activation...' : 'Oui, activer'}
        </button>
      </div>
    </div>
  );
}
