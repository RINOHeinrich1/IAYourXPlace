'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useModelStore } from '../../../store/useModelStore';
import { supabase } from '@/lib/supabaseClient';

export default function ActivateAiPage() {
  const router = useRouter();
  const { reset } = useModelStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = () => {
    if (!isProcessing) router.back();
  };

  const handleActivate = async () => {
    try {
      setIsProcessing(true);

      // 1️⃣ Récupérer le profil sauvegardé
      const profile = JSON.parse(localStorage.getItem("model_profile") || "{}");

      if (!profile?.name) {
        alert("Aucune donnée trouvée. Veuillez recommencer la création.");
        router.push("/creer-modele");
        return;
      }

      // 2️⃣ Construire le prompt pour AliveAI
      const appearancePrompt = profile.description || "Portrait d'un personnage réaliste";

      const aliveAIRequest = {
        name: profile.name,
        appearance: appearancePrompt,
        detailLevel: "HIGH",
        gender: profile.gender?.toUpperCase() === "FEMALE" ? "MALE" : "HOMMES",
        fromLocation: profile.ethnicities?.[0]?.toUpperCase() || "ASIA",
        age: profile.age,
        ethnicities: profile.ethnicities || [],
        hairType: profile.hair_type || "",
        hairColor: profile.hair_color || "",
        eyeColor: profile.eye_color || "",
        bodyType: profile.body_type || "",
        chestSize: profile.chest_size || "",
        personality: profile.personality || "",
        faceImproveEnabled: true,
        faceModel: "REALISM",
        model: "REALISM",
        aspectRatio: "PORTRAIT",
        blockExplicitContent: false,
        scene: profile.systemPrompt || "Générer un personnage photoréaliste",
      };

      // 3️⃣ Envoyer la requête AliveAI
      const response = await fetch("/api/aliveai/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aliveAIRequest),
      });

      if (!response.ok) throw new Error("Erreur API AliveAI");
      const data = await response.json();
      const promptId = data?.promptId;
      if (!promptId) throw new Error("Aucun promptId reçu.");

      // 4️⃣ Polling pour récupérer l'image
      let attempts = 0;
      const maxAttempts = 300; // 10 minutes
      const interval = 2000;

      const poll = setInterval(async () => {
        attempts++;

        const res = await fetch(`/api/aliveai/generate-character?promptId=${promptId}`);
        const imgData = await res.json();

        if (imgData.isComplete && imgData.imageUrl) {
          clearInterval(poll);

          const imageUrl = imgData.imageUrl;

          // 5️⃣ Auth Supabase
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;

          if (!user) {
            alert("Utilisateur non connecté.");
            setIsProcessing(false);
            return;
          }

          // 6️⃣ Préparer les données pour Supabase
          const payload = {
            name: profile.name,
            description: profile.description || "",
            version: "1.0.0",
            status: "Activé",
            personality: profile.personality || "",
            avatar_url: imageUrl,
            greetings: profile.greetings || [],
            systemPrompt: profile.systemPrompt || "",
            age: Number(profile.age) || null,
            ethnicities: profile.ethnicities || [],
            hair_type: profile.hair_type || "",
            hair_color: profile.hair_color || "",
            eye_color: profile.eye_color || "",
            body_type: profile.body_type || "",
            chest_size: profile.chest_size || "",
            relationship: profile.relationship || [],
            profession: profile.profession || [],
            sexual_preferences: profile.sexual_preferences || [],
            voice: profile.voice || "",
            created_by: user.id,
            gender: profile.gender || "femmes",
            is_public: false,
          };

          // 7️⃣ Insérer dans Supabase
          const { error: insertError } = await supabase.from("ai_models").insert(payload);
          if (insertError) {
            console.error(insertError);
            alert("Erreur lors de l’enregistrement en base.");
            setIsProcessing(false);
            return;
          }

          // 8️⃣ Nettoyer et rediriger
          reset();
          localStorage.removeItem("model_profile");

          router.push("/mesia");
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          alert("Temps dépassé. Veuillez réessayer.");
          setIsProcessing(false);
        }
      }, interval);

    } catch (error: any) {
      console.error("Erreur:", error);
      alert(error?.message || "Erreur lors de l’activation.");
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/bgimage2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay flou */}
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitBackdropFilter: "blur(15px)",
          backdropFilter: "blur(15px)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
        }}
      ></div>

      {/* Close */}
      <button
        onClick={handleCancel}
        className="absolute top-6 right-6 z-10 w-[90px] h-[90px] flex items-center justify-center"
        disabled={isProcessing}
      >
        <Image src="/icons/close.png" alt="close" width={70} height={70} />
      </button>

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-[32px] shadow-xl"
        style={{
          width: "409px",
          height: "434px",
          background: "rgba(22,22,22,1)",
          padding: "40px 20px",
        }}
      >
        <h2 className="text-white text-xl font-bold text-center mb-6">
          {isProcessing ? "Activation en cours..." : "Activer votre IA"}
        </h2>

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-400 text-center">
              Votre modèle IA est en cours de génération...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Confirmez-vous l'activation de votre modèle IA ?
            </p>
            <p className="text-gray-400 text-sm">
              Votre IA sera disponible dans "Mes IA".
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mt-10 z-10">
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className={`w-[150px] h-[50px] rounded-xl text-white font-semibold transition
            ${isProcessing ? "bg-gray-500 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"}`}
        >
          Annuler
        </button>

        <button
          onClick={handleActivate}
          disabled={isProcessing}
          className={`w-[150px] h-[50px] rounded-xl text-white font-semibold transition
            ${isProcessing ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
        >
          {isProcessing ? "Activation..." : "Oui, activer"}
        </button>
      </div>
    </div>
  );
}
