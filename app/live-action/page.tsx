"use client";
import React, { useState, useEffect } from "react";
import { Gamepad2, HandCoins } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LiveActionCharacter {
  id: string;
  name: string;
  avatar_url: string;
  slug: string;
  description: string;
}

export default function LiveActionPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [character, setCharacter] = useState<LiveActionCharacter | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve character data from localStorage
    const storedCharacter = localStorage.getItem('liveActionCharacter');
    if (storedCharacter) {
      try {
        const parsedCharacter = JSON.parse(storedCharacter);
        setCharacter(parsedCharacter);
      } catch (error) {
        console.error('Error parsing character data:', error);
      }
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Clean up localStorage when closing
    localStorage.removeItem('liveActionCharacter');
    setTimeout(() => {
      router.push("/ai-dashboard");
    }, 100);
  };

  const actions = [
    { label: "Sourire", price: 300 },
    { label: "See my feet", price: 400 },
    { label: "Show my books", price: 450 },
    { label: "Another action demander", price: 500 },
    { label: "Another action demander", price: 500 },
    { label: "Send kiss", price: 600 },
    { label: "Dance for 5 sec", price: 700 },
    { label: "Say my name", price: 350 },
    { label: "Slow turn around", price: 550 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">

      {/* IMAGE DE FOND FULLSCREEN */}
      <Image
        src="/images/bgimage2.png"
        alt="Background"
        fill
        priority
        className="object-cover w-full h-full scale-105"
      />

      {/* OVERLAY GRADIENT + BLUR 40PX */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
        }}
      />

 <button
          onClick={handleClose}
          className="absolute top-5 right-5 cursor-pointer p-2 rounded-full transition"
        >
          <Image src="/icons/close.png" alt="close" width={75} height={75} />
        </button>
      {/* CONTENU CENTRAL */}
      <div className="absolute inset-0 flex justify-center mt-22 items-center p-4">

        {/* Bouton fermer */}
       

        <div className="relative flex w-full max-w-5xl h-[85vh] gap-4">

          {/* ---------------- LEFT CARD ---------------- */}
          <div className="w-1/2 bg-[#222222] rounded-2xl shadow-xl relative overflow-hidden">

            {/* Profil TRÈS ROND */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
              <Image
                src={character?.avatar_url || "/images/group.png"}
                alt={character?.name || "Profile"}
                width={64}
                height={64}
                className="rounded-full border-2 border-white object-cover"
                style={{ borderRadius: "999px" }}
              />
              <span className="text-white font-semibold text-base">
                {character?.name || "Personnage"}
              </span>
            </div>

            {/* Grande image */}
            <Image
              src={character?.avatar_url || "/images/group.PNG"}
              alt={character?.name || "Live Model"}
              fill
              className="object-cover rounded-2xl"
            />
          </div>

          {/* ---------------- RIGHT CARD ---------------- */}
          <div className="w-[46%] bg-[#181818] rounded-2xl shadow-xl flex flex-col p-5 relative">

            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-red-500" />
              <h3 className="text-white text-lg font-bold">
                Action en Direct {character?.name ? `- ${character.name}` : ""}
              </h3>
            </div>

            {/* Actions */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className="w-full flex justify-between items-center text-white/80 py-2.5 px-3 hover:bg-white/5 rounded-md transition group"
                >
                  <span className="text-sm font-medium group-hover:text-white">
                    {action.label}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-yellow-400 font-bold text-sm">
                      {action.price}
                    </span>
                    <HandCoins className="w-4 h-4 text-yellow-400" />
                  </div>
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}