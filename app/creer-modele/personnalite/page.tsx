'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { useModelStore } from '../../../store/useModelStore';
import { useRouter } from 'next/navigation';

// --- ALIVEAI IMAGE GENERATION ---
interface GenerateCharacterResponse {
  success: boolean;
  promptId?: string;
  seed?: string;
  isComplete?: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
}

async function generateCharacterImage(params: {
  name: string;
  gender: string;
  age: number;
  ethnicities: string[];
  hairType: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  chestSize: string;
  personality?: string[];
}): Promise<{ imageUrl: string; promptId: string }> {
  // Start the generation
  const startResponse = await fetch('/api/aliveai/generate-character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const startData: GenerateCharacterResponse = await startResponse.json();

  if (!startResponse.ok || !startData.success || !startData.promptId) {
    throw new Error(startData.error || 'Erreur lors du démarrage de la génération');
  }

  const promptId = startData.promptId;

  // Poll for completion (max 5 minutes with 3 second intervals)
  const maxAttempts = 100;
  const pollInterval = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(`/api/aliveai/generate-character?promptId=${promptId}`);
    const statusData: GenerateCharacterResponse = await statusResponse.json();

    if (!statusResponse.ok) {
      throw new Error(statusData.error || 'Erreur lors de la vérification du statut');
    }

    if (statusData.isComplete && statusData.imageUrl) {
      return { imageUrl: statusData.imageUrl, promptId };
    }
  }

  throw new Error('Timeout: La génération d\'image a pris trop de temps');
}

// --- CONFIGURATION ET STYLES ---
const INPUT_GRADIENT_STYLE = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
};
const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: true, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];
const backItem = {
  name: 'Revenir dans myXplace', iconPath: '/icons/back_arrow.png', href: '/',
};

// --- COMPOSANTS D'INTERFACE (FRONT-END) ---

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>
    <nav className="space-y-3">
      {aiNavItems.map((item) => (
        <Link key={item.name} href={item.href} className={`flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'}`}>
          <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
          <span>{item.name}</span>
        </Link>
      ))}
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


interface SelectionGroupProps {
  title: string;
  onOpenModal: () => void;
  currentSelection: string | string[] | null;
}

const SelectionGroup: React.FC<SelectionGroupProps> = ({ title, onOpenModal, currentSelection }) => {

  const displayValue = Array.isArray(currentSelection)
    ? (currentSelection.length > 0 ? currentSelection.join(', ') : 'Cliquer pour modifier')
    : (currentSelection || 'Cliquer pour modifier');

  const displayClass = (Array.isArray(currentSelection) && currentSelection.length > 0) || (!Array.isArray(currentSelection) && currentSelection)
    ? 'text-white'
    : 'text-gray-400';

  const internalTitle = title.toUpperCase().includes('PENCHANTS SEXUELS') ? 'QUELS SONT SES PENCHANTS SEXUELS' : title.toUpperCase().replace('LA ', 'CHOISIR LA ').replace('LE ', 'CHOISIR LE ');


  return (
    <div className="w-full relative mb-6">
      <button
        type="button"
        onClick={onOpenModal}
        style={INPUT_GRADIENT_STYLE}
        className="w-full p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors text-left h-24 flex flex-col justify-center"
      >
        <p className="text-sm text-gray-400 uppercase font-semibold mb-1">
          {internalTitle}
        </p>
        <p className={`text-lg font-bold truncate ${displayClass}`}>
          {displayValue}
        </p>
      </button>
    </div>
  );
};

interface SelectionModalProps {
  title: string;
  options: string[];
  selected: string | string[] | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  isMultiSelect: boolean;
}

const SelectionModal: React.FC<SelectionModalProps & { modalType?: string }> = ({
  title: _title,
  options,
  selected,
  onSelect,
  onClose,
  isMultiSelect: _isMultiSelect,
  modalType
}) => {

  const isSelected = (opt: string) =>
    Array.isArray(selected) ? selected.includes(opt) : selected === opt;

  const baseButtonStyle = {
    padding: "14px 0",
    borderRadius: "18px",
    fontSize: "20px",
  };

  const relationshipImages: Record<string, string> = {
    "Petit Amis": "/images/relation1.png",
    "Plan Cul": "/images/relation2.png",
    "Camarade": "/images/relation3.png",
    "Collègue": "/images/relation4.png",
    "Épouse": "/images/relation5.png",
    "Maîtresse": "/images/relation6.png",
    "Amis": "/images/relation7.png",
    "Sugarbaby": "/images/relation8.png",
    "Étudiante": "/images/relation9.png",
    "Inconnue": "/images/relation10.png",
  };

   // --- VOICE MODAL IMAGES (ASSURE-TOI D'AVOIR CES FICHIERS) ---
  const voiceImages: Record<string, string> = {
    "Voix 1": "/images/voix.jpg",
    "Voix 2": "/images/voix.jpg",
    "Voix 3": "/images/voix.jpg",
    "Voix 4": "/images/voix.jpg",
    "Voix 5": "/images/voix.jpg",
    "Voix 6": "/images/voix.jpg",
    "Voix 7": "/images/voix.jpg",
    "Voix 8": "/images/voix.jpg",
    "Voix 9": "/images/voix.jpg",
  };


  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{
        backdropFilter: "blur(25px)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)"
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[999]"
      >
        <Image src="/icons/close.png" alt="close" width={66} height={66} />
      </button>

      <h3 className="text-2xl font-bold mb-10 text-center text-white drop-shadow-xl">
        {modalType === 'relationship' ? 'Modifier le type de relation' :
         modalType === 'profession' ? 'Modifier la profession' :
         'Modifier la personnalité'}
      </h3>

      <div
  className={`grid ${
    modalType === "personality"
      ? "justify-start"
      : "justify-center"
  }`}
  style={{
    gap:
      modalType === "personality"
        ? "33px"
        : modalType === "voice"
        ? "18px"
        : "10px",

  
   gridTemplateColumns:
  modalType === 'voice'
    ? "repeat(5, 150px)" // 🔥 5 cartes VOIX première ligne
        : modalType === "relationship"
        ? "repeat(5, min-content)"
        : modalType === "profession"
        ? "repeat(5, min-content)"
        : "repeat(4, min-content)",
  }}
>

        {options.map((opt, index) => {
          const isOptSelected = isSelected(opt);
          const selectedStyle = isOptSelected
            ? "bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.5)]"
            : "bg-gray-700";

          // --- RELATIONSHIP MODAL ---
          if (modalType === 'relationship') {
            const relationshipSelectedImages: Record<string, string> = {
              "Petit Amis": "/images/origine1.png",
              "Plan Cul": "/images/origine1.png",
              "Camarade": "/images/origine1.png",
              "Collègue": "/images/origine1.png",
              "Épouse": "/images/origine1.png",
              "Maîtresse": "/images/origine1.png",
              "Amis": "/images/origine1.png",
              "Sugarbaby": "/images/origine1.png",
              "Étudiante": "/images/origine1.png",
              "Inconnue": "/images/origine1.png",
            };

            return (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="relative flex flex-col justify-end font-semibold rounded-4xl overflow-hidden shadow-lg transition-all"
                style={{ width: "160px", height: "190px" }}
              >
                <Image
                  src={isOptSelected ? relationshipSelectedImages[opt] : relationshipImages[opt]}
                  alt={opt}
                  fill
                  className="object-cover transition-all cursor-pointer"
                />
                <span className="relative z-10 text-white text-center text-xl mb-2">{opt}</span>
                {isOptSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 z-20">
                    <Image src="/icons/check.png" alt="selected" fill className="object-contain" />
                  </div>
                )}
              </button>
            );
          }
// --- VOICE MODAL ---
if (modalType === "voice") {

  const voiceNames: Record<string, string> = {
    "Voix 1": "Assurée",
    "Voix 2": "Enjouée",
    "Voix 3": "Dominatrice",
    "Voix 4": "Innocente",
    "Voix 5": "Douce",
    "Voix 6": "Sensuelle",
    "Voix 7": "Calme",
    "Voix 8": "Réfléchie",
    "Voix 9": "Fantaisiste",
  };

  const isSecondLine = index >= 5; // ✔ VOIX 6 → 9

  return (
    <button
      key={opt}
      onClick={() => onSelect(opt)}
      className={`relative flex flex-col items-center justify-end rounded-3xl overflow-hidden transition-all shadow-lg
        ${isOptSelected ? "shadow-[0_0_20px_rgba(255,0,0,0.7)]" : ""}`}
      style={{
        width: "150px",
        height: "180px",
        paddingBottom: "15px",
        background: "rgba(22,22,22,1)",
        marginLeft: isSecondLine ? "88px" : "0px", // 🔥 Décalage pour centrer la ligne du bas
      }}
    >
      <div className="absolute top-9 w-15 h-15 rounded-full overflow-hidden border-white z-20 bg-white">
  {/* IMAGE PRINCIPALE */}
  <Image
    src={voiceImages[opt]}
    alt={opt}
    fill
    className="object-cover"
  />

  {/* PETITE ICONE SUPERPOSÉE */}
  <div className="absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 z-30">
    <Image
      src="/icons/play.png" // remplace par ton icône
      alt="icon"
      fill
      className="object-contain"
    />
  </div>
</div>

      <span className="mt-24 text-white text-lg font-semibold z-20">
        {opt}
      </span>

      <span className="text-gray-300  font-medium z-20 mt-1">
        {voiceNames[opt]}
      </span>

      {isOptSelected && (
        <div className="absolute top-2 right-2 w-7 h-7 z-30">
          <Image src="/icons/check.png" alt="selected" fill className="object-contain" />
        </div>
      )}
    </button>
  );
}


          
          // --- PERSONALITY MODAL ---
          const isSecondLinePersonality = index >= 4 && index < 8;
          const horizontalPadding = isSecondLinePersonality ? "28px" : "0px";
          // const transformScaleX = isSecondLinePersonality ? "scale(1.2,1)" : "scale(1,1)";

          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`font-semibold transition-all shadow-lg text-white whitespace-nowrap ${selectedStyle}`}
              style={{
                ...baseButtonStyle,
                paddingLeft: horizontalPadding,
                paddingRight: horizontalPadding,
                // transform: transformScaleX,
                background: isOptSelected ? "" : "rgba(114,114,114,1)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};





// --- PAGE PRINCIPALE (Avec logique et soumission) ---
export default function FinalPage() {
  const router = useRouter();
  const { modelData, saveStep } = useModelStore();

  const {
    gender = 'femmes', ethnicities = [], age = '', hairType = '', hairColor = '', eyeColor = '',
    bodyType = '', chestSize = '', name: storedName = '',
    personality: storedPersonality = [], relationship: storedRelationship = [],
    profession: storedProfession = [], sexualPreferences: storedSexualPreferences = [],
    voice: storedVoice = null,
  } = modelData;

  // Assurez-vous que les tableaux sont toujours initialisés comme des tableaux, même si les données du store sont des chaînes (pour la résilience)
  const getArrayFromStore = (data: string | string[] | undefined): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data) return [data];
    return [];
  };

  const [name, setName] = useState(storedName || 'Elizabeth Garcia');
  const [personality, setPersonality] = useState<string[]>(getArrayFromStore(storedPersonality));
  const [relationship, setRelationship] = useState<string[]>(getArrayFromStore(storedRelationship));
  const [profession, setProfession] = useState<string[]>(getArrayFromStore(storedProfession));
  const [sexualPreferences, setSexualPreferences] = useState<string[]>(getArrayFromStore(storedSexualPreferences));
  const [voice, setVoice] = useState<string | null>(storedVoice);

  // --- ALIVEAI GENERATION STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  // --- LOGIQUE MODAL ET OPTIONS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'personality' | 'relationship' | 'profession' | 'sexualPrefs' | 'voice' | null>(null);

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  // Listes d'options harmonisées (utilisant les données de votre dernier code sans front)
  const personalitiesOptions = ['Nympho', 'Amant', 'Soumise', 'Dominatrice', 'Tentatrice', 'Innocente', 'Soignante', 'Expérimentatrice', 'Méchante', 'Confidente', 'Timide', 'Reine'];
  const relationshipsOptions = ['Petit Amis', 'Plan Cul', 'Camarade', 'Collègue', 'Épouse', 'Maîtresse', 'Amis', 'Sugarbaby', 'Étudiante', 'Inconnue'];
  const professionsOptions = ['Strip-teaseuse', 'Mannequin', 'Étudiante', 'Danseuse', 'Femme de chambre', 'Cam Girl', 'Pornstar', 'Barman', 'Streamer', 'Coach Sportif', 'Secrétaire', 'Hôtesse de l\'air', 'Médecin'];
  // J'ai corrigé les fautes de frappe visibles dans votre liste précédente
  const sexualPrefsOptions = ['Bondage', 'Fessée', 'Collier et Laisse', 'Dirty Talk', 'Punition', 'Jeu Anal', 'Jeu Oral', 'Cum Play', 'Creampie', 'Daddy Dominance', 'Éjaculation féminine', 'Edging', 'Obéissance', 'Contrôle', 'Inexpérience', 'Lent et Sensuel', 'Flirte', 'Jeu de séduction érotique', 'Câlin'];
  const voicesOptions = ['Voix 1', 'Voix 2', 'Voix 3', 'Voix 4', 'Voix 5', 'Voix 6', 'Voix 7', 'Voix 8', 'Voix 9'];

  type MultiSelectConfig = {
    title: string;
    options: string[];
    state: string[];
    setState: React.Dispatch<React.SetStateAction<string[]>>;
    isMulti: true;
  };

  type SingleSelectConfig = {
    title: string;
    options: string[];
    state: string | null;
    setState: React.Dispatch<React.SetStateAction<string | null>>;
    isMulti: false;
  };

  const optionsMap: Record<string, MultiSelectConfig | SingleSelectConfig> = {
    personality: { title: 'la Personnalité', options: personalitiesOptions, state: personality, setState: setPersonality, isMulti: true },
    relationship: { title: 'le Type de Relation', options: relationshipsOptions, state: relationship, setState: setRelationship, isMulti: true },
    profession: { title: 'la Profession', options: professionsOptions, state: profession, setState: setProfession, isMulti: true },
    sexualPrefs: { title: 'les Penchants Sexuels', options: sexualPrefsOptions, state: sexualPreferences, setState: setSexualPreferences, isMulti: true },
    voice: { title: 'la Voix', options: voicesOptions, state: voice, setState: setVoice, isMulti: false },
  };

  const handleModalSelect = (value: string, config: MultiSelectConfig | SingleSelectConfig) => {
    if (config.isMulti) {
      const currentState = config.state;
      if (currentState.includes(value)) {
        config.setState(currentState.filter(v => v !== value));
      } else {
        config.setState([...currentState, value]);
      }
    } else {
      config.setState(value);
      closeModal();
    }
  };

  // Condition de validation pour tous les champs, y compris ceux des étapes précédentes
  const isFormValid = name && personality.length > 0 && relationship.length > 0 && profession.length > 0 && sexualPreferences.length > 0 && voice &&
    ethnicities.length > 0 && age && hairType && hairColor && eyeColor && bodyType && chestSize;


  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('Veuillez remplir tous les champs de toutes les étapes avant de continuer.');
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert('Vous devez être connecté pour créer un modèle IA.');
      return;
    }

    // Convert arrays to comma-separated strings for DB storage
    const bodyTypeString = Array.isArray(bodyType) ? bodyType.join(', ') : bodyType;
    const chestSizeString = Array.isArray(chestSize) ? chestSize.join(', ') : chestSize;
    const hairTypeString = Array.isArray(hairType) ? hairType.join(', ') : hairType;
    const hairColorString = Array.isArray(hairColor) ? hairColor.join(', ') : hairColor;
    const personalityString = Array.isArray(personality) ? personality.join(', ') : personality;

    // Start AliveAI image generation
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress('Démarrage de la génération d\'image...');

    let avatarUrl: string;

    try {
      setGenerationProgress('Génération de l\'avatar en cours... Cela peut prendre quelques minutes.');

      const result = await generateCharacterImage({
        name: name.trim(),
        gender,
        age: Number(age),
        ethnicities: Array.isArray(ethnicities) ? ethnicities : [ethnicities],
        hairType: hairTypeString,
        hairColor: hairColorString,
        eyeColor: eyeColor,
        bodyType: bodyTypeString,
        chestSize: chestSizeString,
        personality,
      });

      avatarUrl = result.imageUrl;
      setGenerationProgress('Image générée avec succès !');
    } catch (error) {
      console.error('Erreur AliveAI:', error);
      setGenerationError(error instanceof Error ? error.message : 'Erreur lors de la génération');

      // Fallback to random avatar if AliveAI fails
      const avatarOptions = [
        '/images/A.jpg', '/images/B.jpg', '/images/C.png', '/images/D.jpg',
        '/images/E.jpg', '/images/F.jpg', '/images/G.jpg', '/images/H.jpg',
        '/images/I.jpg', '/images/J.jpg', '/images/K.jpg', '/images/L.jpg', '/images/M.jpg',
      ];
      avatarUrl = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
      setGenerationProgress('Utilisation d\'un avatar par défaut...');
    }

    const systemPrompt = `Tu es ${name}, une ${gender === 'femmes' ? 'femme' : 'homme'} de ${age} ans d'origine ${Array.isArray(ethnicities) ? ethnicities.join(' et ') : ethnicities}. Tu as les cheveux ${hairTypeString} de couleur ${hairColorString} et des yeux ${eyeColor}. Ta personnalité est ${personalityString}. Tu travailles comme ${Array.isArray(profession) ? profession.join(', ') : profession}. Tu es ${Array.isArray(relationship) ? relationship.join(', ') : relationship}. Tu parles avec une voix ${voice || 'naturelle'}.`;

    const aiModelData = {
      name: name.trim(),
      description: `${name}, ${age} ans - ${personalityString}`,
      personality: personalityString,
      systemPrompt,
      greetings: [`Salut ! Je suis ${name}, ravie de te rencontrer ! 💕`],
      avatar_url: avatarUrl,
      gender,
      ethnicities,
      age: Number(age),
      hair_type: hairTypeString,
      hair_color: hairColorString,
      eye_color: eyeColor,
      body_type: bodyTypeString,
      chest_size: chestSizeString,
      relationship,
      profession,
      sexual_preferences: sexualPreferences,
      voice,
      created_by: user.id,
      status: 'active',
      is_public: false,
    };

    setGenerationProgress('Enregistrement du modèle...');

    const { data, error } = await supabase
      .from('ai_models')
      .insert([aiModelData])
      .select()
      .single();

    setIsGenerating(false);

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    } else {
      saveStep({ createdModelId: data.id });
      router.push('/creer-modele/final');
    }
  };

  // Configuration actuelle pour le modal affiché
  const currentConfig = modalType ? optionsMap[modalType] : null;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen">

        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Icone utilisateur */}
          <div className="flex justify-end items-center mb-10 w-full max-w-md">
            <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
              <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-10 text-center w-full">Choisir un nom</h1>

          {/* Champ Nom AVEC DÉGRADÉ */}
          <div className="w-full max-w-xl mb-12">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={INPUT_GRADIENT_STYLE}
              className="w-full p-4 rounded-xl text-white border border-gray-700 text-lg font-bold 
               text-left placeholder-gray-400"
              placeholder="Entrer un nom (max 20 caractères)"
              maxLength={20}
            />
            <div className="text-center text-sm text-gray-500 mt-1">
              <span className="w-full block">{name.length}/20</span>
            </div>
          </div>


          <h2 className="text-2xl font-bold mb-6 text-center w-full">Choisir la personnalité</h2>
          <p className="text-gray-400 mb-10 text-center">Cliquez pour modifier</p>

          {/* GRILLE DE SÉLECTION (Déclenche le modal) */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">

            <SelectionGroup
              title="LA PERSONNALITÉ"
              currentSelection={personality}
              onOpenModal={() => openModal('personality')}
            />

            <SelectionGroup
              title="LE TYPE DE RELATION"
              currentSelection={relationship}
              onOpenModal={() => openModal('relationship')}
            />

            <SelectionGroup
              title="LA PROFESSION"
              currentSelection={profession}
              onOpenModal={() => openModal('profession')}
            />

            <SelectionGroup
              title="SES PENCHANTS SEXUELS"
              currentSelection={sexualPreferences}
              onOpenModal={() => openModal('sexualPrefs')}
            />

            <SelectionGroup
              title="LA VOIX"
              currentSelection={voice}
              onOpenModal={() => openModal('voice')}
            />
            {/* Ajout d'une boîte vide pour l'alignement */}
            <div></div>

          </div>

          {/* BOUTON TERMINER (Centré) */}
          <div className="mt-16 pb-10 flex flex-col items-center">
            {/* Generation Progress */}
            {isGenerating && (
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
                <p className="text-gray-300">{generationProgress}</p>
              </div>
            )}

            {/* Generation Error */}
            {generationError && !isGenerating && (
              <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-200 text-sm text-center max-w-md">
                <p>⚠️ {generationError}</p>
                <p className="text-xs mt-1">Un avatar par défaut sera utilisé.</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isGenerating}
              className={`w-[250px] py-4 rounded-xl text-white text-xl font-bold transition-colors
                            ${isFormValid && !isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 cursor-not-allowed text-gray-400'}`}
            >
              {isGenerating ? 'Génération en cours...' : 'Terminer et enregistrer'}
            </button>
          </div>

        </div>
      </div>

      {/* --- AFFICHAGE CONDITIONNEL DU MODAL --- */}
      {isModalOpen && currentConfig && (
        <SelectionModal
          modalType={modalType ?? undefined}
          title={currentConfig.title}
          options={currentConfig.options}
          selected={currentConfig.state}
          isMultiSelect={currentConfig.isMulti}
          onClose={closeModal}
          onSelect={(value) => handleModalSelect(value, currentConfig)}
        />
      )}

    </div>
  );
}