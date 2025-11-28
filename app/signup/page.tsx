'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ageConfirmed) {
      setError('Vous devez confirmer que vous avez 18 ans ou plus.');
      return;
    }
    if (!cguAccepted) {
      setError('Vous devez accepter les CGU et la politique de confidentialité.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { pseudo },
        // 🔹 Important : redirection après clic sur le lien de confirmation
        emailRedirectTo: 'http://localhost:3000/signup/confirmation'
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // On peut soit afficher un alert soit router vers la page confirmation
      router.push('/signup/confirmation');
    }
  };

  const handleBack = () => router.back();
  const handleSignIn = () => router.push('/login');

  return (
    <div
      className="relative min-h-[120vh] w-full flex justify-center items-start bg-cover bg-center"
      style={{
        backgroundImage: 'url("/bgimage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 z-0 bg-black/80 pointer-events-none"></div>

      <div
        className="relative z-10 mt-10 w-[90%] max-w-[430px] h-[722px] rounded-[32px] flex flex-col items-center gap-6 p-8"
        style={{
          backgroundImage: 'url("/images/bgimageregister.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <img src="/logo.png" className="w-[188px] h-[44px] mt-2" />
        <h1 className="text-white text-2xl font-semibold mt-2">S’inscrire</h1>

        <form className="flex flex-col gap-4 w-full px-4 mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">
              Email <span className="text-red-600 text-xl">*</span>
            </label>
            <input
              type="email"
              className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">
              Mot de passe <span className="text-red-600 text-xl">*</span>
            </label>
            <input
              type="password"
              className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">Pseudo</label>
            <input
              type="text"
              className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
            />
          </div>

          <div className="flex flex-col text-white text-sm gap-2 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
              />
              J’ai 18 ans ou plus
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={cguAccepted}
                onChange={(e) => setCguAccepted(e.target.checked)}
              />
              J’accepte les CGU et la Politique de confidentialité
            </label>
          </div>

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-[180px] mx-auto h-[40px] rounded-[32px] bg-red-700 text-white font-medium text-sm hover:bg-red-800 transition disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(114,107,107,1)' }}>Disposez-vous d’un compte ?</span>
            <button onClick={handleSignIn} className="text-sm" style={{ color: 'rgba(132,14,14,1)' }}>
              S’identifier
            </button>
          </div>

          <button onClick={handleBack} className="text-sm" style={{ color: 'rgba(114,107,107,1)' }}>
            Revenir en arrière
          </button>
        </div>
      </div>
    </div>
  );
}
