'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // États des inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

   if (error) {
  setError(error.message);
} else {
  // Connexion réussie, rediriger vers le dashboard
  router.push('/dashboard');
}
  };

  const handleBack = () => router.back();
  const handleSignUp = () => router.push('/signup');

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
        className="relative z-10 mt-10 w-[90%] max-w-[430px] h-[600px] rounded-[32px] flex flex-col items-center gap-6 p-8"
        style={{
          backgroundImage: 'url("/images/bgimageregister.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <img src="/logo.png" className="w-[188px] h-[44px] mt-2" />
        <h1 className="text-white text-2xl font-semibold mt-2">Se connecter</h1>

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

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-[180px] mx-auto h-[40px] rounded-[32px] bg-red-700 text-white font-medium text-sm hover:bg-red-800 transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(114,107,107,1)' }}>Pas encore de compte ?</span>
            <button onClick={handleSignUp} className="text-sm" style={{ color: 'rgba(132,14,14,1)' }}>
              S’inscrire
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
