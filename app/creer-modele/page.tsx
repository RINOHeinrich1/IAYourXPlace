'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useModelStore } from '../../store/useModelStore';

interface AIModelProfile {
  id: string;
  name: string;
  age: number;
  ethnicities: string[];
  hair_type: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  chest_size: string;
  personality: string;
  relationship: string[];
  profession: string[];
  sexual_preferences: string[];
  voice: string;
  avatar_url?: string;
  description?: string;
  is_alive?: boolean;
  generated_image_url?: string;
  gender?: 'femmes' | 'hommes';

}

interface SidebarProps {
  currentPagePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPagePath }) => {
  const aiNavItems = [
    { name: 'Home', iconPath: '/images/home.png', href: '/ai-dashboard' },
    { name: 'Discuter', iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', iconPath: '/images/mesia.png', href: '/mesia' },
  ];

  const backItem = {
    name: 'Revenir dans myXplace',
    iconPath: '/icons/back_arrow.png',
    href: '/',
  };

  const isActive = (href: string) =>
    href === currentPagePath || (href === '/creer-modele' && currentPagePath.includes('/creer-modele'));

  return (
    <div className="w-[19rem] fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
      <div className="mb-10 mt-2">
        <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
      </div>

      <nav className="space-y-3">
        {aiNavItems.map((item) => {
          const active = isActive(item.href || '');
          const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer transition duration-150
            ${active ? 'text-red-500 font-semibold' : 'text-gray-400 hover:text-white'}`;

          return (
            <Link href={item.href || '#'} key={item.name} className={classes}>
              <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <Link
            href={backItem.href}
            className="w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600"
          >
            <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
            <span>{backItem.name}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

interface ProfileCardProps {
  label: string;
  value: string;
  iconSrc?: string;
  isHighlighted?: boolean;
  size?: 'small' | 'default';
  showIcon?: boolean;
  bgImage?: string;
  bgColor?: string;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  label,
  value,
  iconSrc,
  isHighlighted = false,
  size = 'default',
  showIcon = true,
  bgImage,
  bgColor,
  onClick,
}) => (
  <div
    className={`flex flex-col justify-end relative overflow-hidden rounded-lg transition duration-300 ease-in-out hover:shadow-lg cursor-pointer
      ${isHighlighted ? 'shadow-red-500/30' : 'bg-gray-800'}
      ${size === 'small' ? 'p-2 min-h-[70px] w-[210px]' : 'p-3 min-h-[100px] w-[150px]'}`}
    style={{
      background: bgColor ? bgColor : bgImage ? `url(${bgImage}) center/cover no-repeat` : undefined,
    }}
    onClick={onClick}
  >
    <div>
      <p className={`text-xs ${isHighlighted ? 'text-white/80' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-sm font-semibold ${isHighlighted ? 'text-white' : 'text-white'}`}>{value}</p>
    </div>

    {showIcon && iconSrc && (
      <div className="absolute bottom-0 right-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
        <Image
          src={iconSrc}
          alt={`${label} Icon`}
          width={size === 'small' ? 40 : 70}
          height={size === 'small' ? 40 : 70}
          className="w-auto h-auto"
        />
      </div>
    )}
  </div>
);

const mergeValue = <T,>(newValue: T | undefined, oldValue: T) =>
  newValue !== undefined && newValue !== null ? newValue : oldValue;

export default function SummaryPage() {
  const [profile, setProfile] = useState<AIModelProfile>({
    id: 'default-model',
    name: 'Nom *',
    age: 22,
    ethnicities: ['Occidental'],
    hair_type: 'Lisse',
    hair_color: 'Rose',
    eye_color: 'Bleu',
    body_type: 'Moyenne',
    chest_size: 'Fort',
    personality: 'Ambitieuse, Créative',
    relationship: ['Célibataire'],
    profession: ['Étudiante'],
    sexual_preferences: [],
    voice: 'Voix 1',
    description: 'Apparence',
    is_alive: false
  });

  const [activeTab, setActiveTab] = useState<'appearance' | 'personality'>('appearance');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAIAlive, setIsAIAlive] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState('/images/cheuveux10.png');
  const [userData, setUserData] = useState<any>(null);
  const [isNewModel, setIsNewModel] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '';
  const { modelData, resetModelData } = useModelStore();

 
  // CHANGEMENT CLÉ : Ne plus charger automatiquement le dernier modèle
  useEffect(() => {
    if (!modelData) return;

    // Si modelData contient des données, c'est qu'on vient d'une page de choix
    // On met à jour le profil avec ces données
    setProfile(prev => ({
      ...prev,
      name: mergeValue(modelData.name, prev.name),
      age: mergeValue(modelData.age, prev.age),
      ethnicities: mergeValue(modelData.ethnicities, prev.ethnicities),
      hair_type: mergeValue(modelData.hairType, prev.hair_type),
      hair_color: mergeValue(modelData.hairColor, prev.hair_color),
      eye_color: mergeValue(modelData.eyeColor, prev.eye_color),
      body_type: mergeValue(modelData.bodyType, prev.body_type),
      chest_size: mergeValue(modelData.chestSize, prev.chest_size),
      personality: mergeValue(modelData.personality, prev.personality),
      relationship: mergeValue(modelData.relationship, prev.relationship),
      profession: mergeValue(modelData.profession, prev.profession),
      sexual_preferences: mergeValue(
        modelData.sexualPreferences,
        prev.sexual_preferences
      ),
      voice: mergeValue(modelData.voice, prev.voice),
      description: mergeValue(modelData.description, prev.description),
    }));
    
    // Marquer que ce n'est pas un nouveau modèle si on a des données
    if (Object.keys(modelData).length > 0) {
      setIsNewModel(false);
    }
  }, [modelData]);

  // Charger l'utilisateur seulement
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserData(user);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    loadUser();
  }, []);

  const goToEthnicityChoice = () => router.push('/creer-modele/Ethnicities');
  const goToAgeChoice = () => router.push('/creer-modele/Ethnicities');
  const goToEyeColorChoice = () => router.push('/creer-modele/type-cheveux');
  const goToBodyTypeChoice = () => router.push('/creer-modele/type-corps'); 
  const goToChestSizeChoice = () => router.push('/creer-modele/type-corps');
  const goToHairTypeChoice = () => router.push('/creer-modele/type-cheveux');
  const goToHairColorChoice = () => router.push('/creer-modele/type-cheveux');
  const goToPersonalityChoice = () => router.push('/creer-modele/personnalite');
  const goToRelationshipChoice = () => router.push('/creer-modele/personnalite');
  const goToProfessionChoice = () => router.push('/creer-modele/personnalite');
  const goToSexualPreferencesChoice = () => router.push('/creer-modele/personnalite');
  const goToVoiceChoice = () => router.push('/creer-modele/personnalite');
  const goToNameChoice = () => router.push('/creer-modele/personnalite');
  const goToDescriptionChoice = () => router.push('/creer-modele/description');

  // const handleSave = async () => {
  //   try {
  //     setSaving(true);
      
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) {
  //       alert('Veuillez vous connecter pour sauvegarder');
  //       return;
  //     }

  //     // Créer un nouveau modèle à partir des données actuelles
  //     const modelToSave = {
  //       name: profile.name,
  //       age: profile.age,
  //       ethnicities: profile.ethnicities,
  //       hair_type: profile.hair_type,
  //       hair_color: profile.hair_color,
  //       eye_color: profile.eye_color,
  //       body_type: profile.body_type,
  //       chest_size: profile.chest_size,
  //       personality: profile.personality,
  //       relationship: profile.relationship,
  //       profession: profile.profession,
  //       sexual_preferences: profile.sexual_preferences,
  //       voice: profile.voice,
  //       description: profile.description,
  //       is_alive: false,
  //       created_by: user.id,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //     };

  //     // Toujours créer un nouveau modèle au lieu de mettre à jour
  //     const result = await supabase
  //       .from('ai_models')
  //       .insert([modelToSave])
  //       .select()
  //       .single();

  //     if (result.error) throw result.error;
      
  //     if (result.data) {
  //       setProfile(prev => ({ ...prev, id: result.data.id }));
  //       setIsNewModel(false);
  //       alert('Modèle sauvegardé avec succès!');
  //     }
  //   } catch (error) {
  //     console.error('Erreur lors de la sauvegarde:', error);
  //     alert('Erreur lors de la sauvegarde');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

const handleGiveLife = async () => {
  try {
    setSaving(true);

    if (!userData) {
      alert('Veuillez vous connecter pour donner vie à votre IA');
      return;
    }

    // Construire le prompt complet pour AliveAI
    const appearancePrompt = `A beautiful ${
      profile.gender?.toLowerCase() === 'hommes' ? 'man' : 'woman'
    }, ${profile.ethnicities?.[0] || ''}, ${profile.age} years old, ${profile.hair_type} ${profile.hair_color} hair, ${
      profile.eye_color
    } eyes, ${profile.body_type} body type, ${profile.chest_size} chest, ${profile.personality} expression, high quality, photorealistic`;

    // Corps de la requête vers ton API
    const aliveAIRequest = {
      name: profile.name,
      appearance: appearancePrompt,
      detailLevel: 'HIGH',
      gender: profile.gender?.toUpperCase() === 'HOMMES' ? 'MALE' : 'FEMALE',
      fromLocation: profile.ethnicities?.[0]?.toUpperCase() || 'ASIA',
      age: profile.age,
      ethnicities: profile.ethnicities,
      hairType: profile.hair_type,
      hairColor: profile.hair_color,
      eyeColor: profile.eye_color,
      bodyType: profile.body_type,
      chestSize: profile.chest_size,
      personality: profile.personality,
      faceImproveEnabled: true,
      faceModel: 'REALISM',
      model: 'REALISM',
      aspectRatio: 'PORTRAIT',
      blockExplicitContent: false,
      scene: profile.description || undefined,
    };

    // 1️⃣ POST → créer le prompt AliveAI
    const response = await fetch('/api/aliveai/generate-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aliveAIRequest),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du prompt AliveAI');
    const data = await response.json();
    const promptId = data?.promptId;
    if (!promptId) throw new Error('Aucun promptId reçu d\'AliveAI');

    alert('Génération de l’image en cours... Cela peut prendre quelques minutes.');

    // 2️⃣ Polling pour récupérer l’image
    let attempts = 0;
    const maxAttempts = 300; // ~10 minutes
    const interval = 2000; // 2 secondes

    const pollImage = setInterval(async () => {
      attempts++;
      try {
        const getResponse = await fetch(`/api/aliveai/generate-character?promptId=${promptId}`);
        const getData = await getResponse.json();

        if (getData.isComplete && getData.imageUrl) {
          clearInterval(pollImage);
          const generatedImageUrl = getData.imageUrl;
          setAiImageUrl(generatedImageUrl); // Mettre à jour l'état pour afficher l'image
          alert('Image générée avec succès !');

          // Redirection vers la page Activate AI
          // router.push('/creer-modele/activate-ai');
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollImage);
          alert('La génération de l’image a pris trop de temps. Veuillez réessayer plus tard.');
        }
      } catch (err: any) {
        clearInterval(pollImage);
        console.error('Erreur lors du polling AliveAI:', err);
        alert('Erreur lors de la génération de l’image. Veuillez réessayer.');
      }
    }, interval);
  } catch (error: any) {
    console.error('Erreur lors de l\'activation:', error);
    alert(error?.message || 'Erreur lors de l\'activation');
  } finally {
    setSaving(false);
  }
};


  const handleResetToDefault = () => {
    setProfile({
      id: 'default-model',
      name: 'Nom *',
      age: 22,
      ethnicities: ['Occidental'],
      hair_type: 'Lisse',
      hair_color: 'Rose',
      eye_color: 'Bleu',
      body_type: 'Moyenne',
      chest_size: 'Fort',
      personality: 'Ambitieuse, Créative',
      relationship: ['Célibataire'],
      profession: ['Étudiante'],
      sexual_preferences: [],
      voice: 'Voix 1',
      description: 'Apparence*',
      is_alive: false
    });
    setIsAIAlive(false);
    setAiImageUrl('/images/cheuveux10.png');
    setIsNewModel(true);
    resetModelData();
  };

  const MainContent = () => (
    <div className="flex-1 p-10 ml-[17rem] bg-black text-white min-h-screen flex justify-center">
      <div className="max-w-4xl w-full flex space-x-8">
        
        {/* Colonne gauche : Image */}
        <div className="w-1/3 flex justify-center flex-shrink-0">
          <div className="w-[330px] h-[575px] rounded-xl overflow-hidden bg-gray-800 shadow-2xl relative">
            <Image
              src={aiImageUrl}
              alt={`Profil de ${profile.name}`}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            {/* <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
              isAIAlive ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isAIAlive ? 'VIVANT' : 'MODÈLE PAR DÉFAUT'}
            </div> */}
          </div>
        </div>

        {/* Colonne droite : Données */}
        <div className="w-2/3 space-y-6 flex flex-col">
          
          <div className="space-y-4">
            <div className=" p-4 rounded-lg">
              {/* <label className="block text-sm font-medium text-gray-300 mb-2">Nom de votre IA</label> */}
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-57 px-4 py-2 border border-gray-700 rounded-lg text-white"
                placeholder="Nom de votre IA"
              />
            </div>
            
            <div className="p-4 rounded-lg">
              {/* <label className="block text-sm font-medium text-gray-300 mb-2">Description</label> */}
              <textarea
                value={profile.description || ''}
                onChange={(e) => setProfile({...profile, description: e.target.value})}
                className="w-99 px-4 py-2  border border-gray-700 rounded-lg text-white h-24 resize-none"
                placeholder="Décrivez votre IA"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-[137px] h-[44px] rounded-[32px] cursor-pointer flex items-center justify-center
                px-[20px] py-[10px] text-white font-semibold transition duration-200
                ${activeTab === 'appearance' ? 'bg-[rgba(217,26,42,1)]' : 'bg-[rgba(87,87,87,1)]'}`}
            >
              Apparence
            </button>
            <button
              onClick={() => setActiveTab('personality')}
              className={`w-[137px] h-[44px] rounded-[32px] cursor-pointer flex items-center justify-center
                px-[20px] py-[10px] text-white font-semibold transition duration-200
                ${activeTab === 'personality' ? 'bg-[rgba(217,26,42,1)]' : 'bg-[rgba(87,87,87,1)]'}`}
            >
              Personnage
            </button>
          </div>

          {activeTab === 'appearance' && (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-2 gap-y-2 justify-start">
              <ProfileCard
                label="Ethnicité"
                value={profile.ethnicities[0] || 'N/A'}
              
                size="small"
                bgImage="/images/colection3.png"
                onClick={goToEthnicityChoice}
              />
              
              <ProfileCard
                label="Âge"
                value={`${profile.age} ans`}
                isHighlighted
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToAgeChoice}
              />

              <ProfileCard
                label="Couleur des yeux"
                value={profile.eye_color || 'N/A'}
                size="small"
                bgImage="/images/yeux1.png"
                showIcon={false}
                onClick={goToEyeColorChoice}
              />

              <ProfileCard 
                label="Type de corps" 
                value={profile.body_type} 
                isHighlighted 
                 bgImage="/images/TPcorps.png"
                size="small"
                onClick={goToBodyTypeChoice}
              />

              <ProfileCard 
                label="Taille de poitrine" 
                value={profile.chest_size} 
            bgImage="/images/TPpoitrine.jpg"
                size="small"
                onClick={goToChestSizeChoice}
              />

              <ProfileCard 
                label="Coiffure" 
                value={profile.hair_type} 
              
                bgImage="/images/cheuveux6.png"
                size="small"
                onClick={goToHairTypeChoice}
              />

              <ProfileCard 
                label="Couleur de cheveux" 
                value={profile.hair_color} 
             
                bgImage="/images/imgmes1.png"
                size="small"
                onClick={goToHairColorChoice}
              />
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 justify-start">
              <ProfileCard 
                label="Nom" 
                value={profile.name} 
                isHighlighted
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToNameChoice}
              />
              
              <ProfileCard
                label="Personnalité"
                value={profile.personality || 'N/A'}
                isHighlighted
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToPersonalityChoice}
              />

              <ProfileCard 
                label="Relations" 
                value={profile.relationship[0] || 'N/A'} 
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToRelationshipChoice}
              />

              <ProfileCard 
                label="Profession" 
                value={profile.profession[0] || 'N/A'} 
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToProfessionChoice}
              />

              <ProfileCard
                label="Penchants sexuels"
                value={Array.isArray(profile.sexual_preferences) ? profile.sexual_preferences.join(', ') : (profile.sexual_preferences || 'N/A')}
                size="small"
                showIcon={false}
                bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
                onClick={goToSexualPreferencesChoice}
              />

              <ProfileCard 
                label="Voix" 
                value={profile.voice} 
                size="small"
                showIcon={false}  
                bgImage="/images/voix.jpg"
                onClick={goToVoiceChoice}
              />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex space-x-4 mt-8">
            {/* <button
              onClick={handleSave}
              disabled={saving || isAIAlive}
              className="w-[200px] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-base transition"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button> */}
            
            <button
              onClick={handleGiveLife}
              disabled={saving || isAIAlive}
              className={`w-[240px] py-3 cursor-pointer text-white font-bold rounded-xl text-base transition ${
                isAIAlive ? 'bg-green-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAIAlive ? 'IA Active ✓' : 'Donner vie à mon IA'}
            </button>
            
            {/* <button
              onClick={handleResetToDefault}
              disabled={saving || isNewModel}
              className="w-[180px] py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-bold rounded-xl text-base transition"
            >
              Réinitialiser
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar currentPagePath={currentPath} />
      <MainContent />
    </div>
  );
}