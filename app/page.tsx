'use client';

import React, { useState, useEffect } from 'react';
import { User, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Logo ---
const Logo = ({ size = "normal" }) => (
  <div className={`flex items-center font-sans tracking-tighter ${size === "large" ? "text-4xl" : "text-2xl"}`}>
    <img src="/logo2.png" alt="Logo" className="w-[203px] h-[59px]" />
  </div>
);

// --- Slides ---
const SLIDES = [
  {
    id: 0,
    title: <>Découvrez du <br /> contenu exclusif <br /> chaque jour</>,
    text: <>Playlists, stories, tips et recommandations personnalisées <br /> rien que pour vous.</>,
  },
  {
    id: 1,
    title: <>Plonger dans <br /> des expériences <br /> immersives</>,
    text: <>VOD, VR et AR — regardez, interagissez et vivez chaque <br /> instant.</>,
  },
  {
    id: 2,
    title: <>Vos créateurs <br /> favoris à portée de <br /> main</>,
    text: <>Suivez, likez, commentez et participez aux lives en direct</>,
  },
];

export default function Page() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [email, setEmail] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Slider auto ---
  useEffect(() => {
    if (currentPage !== 'landing') return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const handleDiscover = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage('age-gate');
  };

  const handleDiscoverClick = () => {
    setCurrentPage("age-gate");
  };

  const goToSlide = (index: number) => setCurrentSlideIndex(index);

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');

  return (
    <div className="min-h-screen text-white overflow-hidden relative font-sans selection:bg-red-600 selection:text-white">

      {/* --- BG IMAGE --- */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/bgimage.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="absolute inset-0 z-0 bg-black/80 pointer-events-none"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 h-screen flex flex-col">

        {currentPage === 'landing' ? (
          <>
            {/* HEADER */}
            <header className="flex justify-between items-center px-6 md:px-10 py-4 md:py-6">
              <div className="ml-6 md:ml-20"><Logo /></div>

              <div className="flex items-center space-x-3 md:space-x-4 text-gray-300 text-sm md:text-base font-medium mr-4 md:mr-20">

                <div className="flex items-center cursor-pointer hover:text-white transition group">
                  <Globe size={18} className="mr-1 group-hover:text-red-500" />
                  <span>Français</span>
                </div>

                {/* MENU USER */}
                <div className="relative">
                  <div
                    onClick={toggleMenu}
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-red-600 hover:text-white transition duration-300"
                  >
                    <User size={20} />
                  </div>

                  {isOpen && (
                    <div
                      className="absolute top-11 -left-29 w-[150px] h-[98px] bg-[rgba(217,217,217,0.1)] border-2 border-white rounded-xl flex flex-col gap-4 p-3 shadow-lg"
                      style={{ zIndex: 50 }}
                    >
                      <button
                        onClick={handleLogin}
                        className="w-full h-[38px] cursor-pointer border border-white/60 text-white font-medium rounded-lg hover:bg-red-700 transition"
                      >
                        S'identifier
                      </button>
                      <button
                        onClick={handleRegister}
                        className="w-full h-[38px] cursor-pointer border border-white/60 text-white font-medium rounded-lg hover:bg-red-700 transition"
                      >
                        S’inscrire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* MAIN */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 text-center -mt-22">
              <div className="max-w-20xl mx-auto mt-22 bg-white/5 backdrop-blur-sm p-2 md:p-4 rounded-xl shadow-lg">

                <div className={`transition-all duration-500 ease-in-out transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <h1 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight drop-shadow-xl">
                    {SLIDES[currentSlideIndex].title}
                  </h1>
                  <p className="text-[#9E9B9B] text-xl md:text-[27px] mx-auto mb-2 leading-[100%]">
                    {SLIDES[currentSlideIndex].text}
                  </p>
                </div>

              </div>

              {/* POINTS */}
              <div className="flex justify-center space-x-4 mt-8">
                {SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlideIndex
                        ? "w-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full p-4 md:p-8 flex justify-center">

              {/* SI MENU FERMÉ → FORMULAIRE */}
              {!isOpen ? (
                <form
                  onSubmit={handleDiscover}
                  className="w-full max-w-2xl flex flex-col md:flex-row gap-3 items-center mx-auto"
                >
                  <div className="relative flex-grow w-full md:flex-[2]">
                    <input
                      type="email"
                      placeholder="Adresse e-mail"
                      className="w-full bg-black/5 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition backdrop-blur-md text-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full cursor-pointer md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 text-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:-translate-y-1"
                  >
                    Découvrir
                  </button>
                </form>
              ) : (

                /* SI MENU OUVERT → BOUTON CENTRÉ */
                <div className="flex justify-center w-full mt-8">
                  <button
                    onClick={handleDiscoverClick}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 text-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:-translate-y-1"
                  >
                    Découvrir
                  </button>
                </div>
              )}
            </footer>

          </>
        ) : (
       

          <div className="flex-grow flex flex-col items-center justify-center px-4 text-center animate-fade-in">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: 'url("/bgimage2.png")', // <-- mettre le nom de ton image ici
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>

            <div className="relative z-10 flex flex-col items-center mt-20">
              {/* Logo */}
              <div className="flex justify-center mb-6 scale-110">
                <img src="/logo2.png" alt="Logo" className="w-[203px] h-[59px]" />
              </div>


              <h2 className="text-xl md:text-xl font-medium text-white mb-2 tracking-wide">
                My X Place est pour les adultes seulement
              </h2>
              <h3 className="text-2xl md:text-xl font-black text-white mb-6 drop-shadow-lg">
                VOUS ÊTES PLUS DE <span className="text-red-500">18 ANS</span> ?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 w-full">


                <button
                  onClick={() => alert("Accès autorisé (Simulation)")}
                  className="w-full sm:w-40 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 cursor-pointer text-white font-bold py-1  rounded-3xl text-base transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transform hover:-translate-y-1"
                >
                  JE SUIS 18+
                </button>
                <button
                  onClick={() => setCurrentPage('landing')}
                  className="w-full sm:w-auto text-gray-400 hover:text-white cursor-pointer font-medium py-2 px-6 transition-colors border-b border-transparent hover:border-gray-500"
                >
                  Quitter
                </button>
              </div>
              <div className="text-xs text-gray-400 space-y-4 max-w-lg mx-auto leading-relaxed">
                <p className="text-gray-300 text-xs leading-relaxed text-left px-4">
                  En accédant à ce site, vous acceptez de vous conformer à nos{" "}
                  <a href="#" className="text-blue-700 font-medium transition">
                    Termes de service
                  </a>{" "}
                  et notre{" "}
                  <a href="#" className="text-blue-700 font-medium transition">
                    Politique de confidentialité
                  </a>
                  .

                  Vous reconnaissez que le contenu peut inclure des images, vidéos ou textes à caractère adulte et que vous assumez la responsabilité de votre accès.
                  <br />  <br />
                  Si vous n’êtes pas majeur(e) ou si vous n’acceptez pas ces conditions, vous devez quitter immédiatement ce site.
                </p>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- Animation fade-in --- */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
