'use client';

import { Suspense, useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Vetements, { vetementsImages } from '../../components/Vetements';
import Actions, { actionsImages } from '../../components/Actions';
import Poses, { posesImages } from '../../components/Poses';
import Accessoires, { accessoiresImages } from '../../components/Accessoires';
import Scenes, { scenesImages } from '../../components/Scenes';
import { supabase } from '../../../lib/supabaseClient';

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = { name: 'Revenir dans myXplace', iconPath: '/icons/back_arrow.png', href: '/' };

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>
    <nav className="space-y-3">
      {aiNavItems.map((item) => {
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${
          item.active ? 'font-semibold' : 'text-gray-400 hover:text-white'
        }`;
        return item.href ? (
          <Link href={item.href} key={item.name} className={classes}>
            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
            <span>{item.name}</span>
          </Link>
        ) : (
          <div key={item.name} className={classes}>
            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
            <span>{item.name}</span>
          </div>
        );
      })}
      <div className="pt-6">
        <Link href={backItem.href} className="w-full flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer text-white hover:bg-red-600 transition-colors">
          <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
          <span>{backItem.name}</span>
        </Link>
      </div>
    </nav>
  </div>
);

interface Card { id: number; icon: string; value: number; }
interface AIModel {
  id: string;
  name: string;
  avatar_url?: string;
  description?: string;
  personality?: string;
  ethnicities?: string[];
  age?: number;
  gender?: string;
  hair_type?: string;
  hair_color?: string;
  eye_color?: string;
  body_type?: string;
  chest_size?: string;
}

interface PageProps { params: Promise<{ slug: string }>; }

const createSlug = (name: string): string => {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

function GenerationSlugContent({ slug }: { slug: string }) {
  const [character, setCharacter] = useState<AIModel | null>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);

  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCount, setImageCount] = useState(1);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState('Vetements');

  const [selectedVetements, setSelectedVetements] = useState<number[]>([]);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [selectedPoses, setSelectedPoses] = useState<number[]>([]);
  const [selectedAccessoires, setSelectedAccessoires] = useState<number[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [textareaContent, setTextareaContent] = useState('');

  const topLinks = ['Vetements', 'Actions', 'Poses', 'Accessoires', 'Scenes'];
  const smallCards: Card[] = [
    { id: 1, icon: '/icons/icon.png', value: 1 },
    { id: 2, icon: '/icons/carer.png', value: 4 },
    { id: 3, icon: '/icons/icon.png', value: 16 },
    { id: 4, icon: '/icons/icon.png', value: 32 },
    { id: 5, icon: '/icons/icon.png', value: 64 },
  ];

  useEffect(() => {
    const fetchCharacter = async () => {
      setLoadingCharacter(true);
      try {
        const stored = localStorage.getItem('selectedCharacter');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.slug === slug || createSlug(parsed.name) === slug) {
            const response = await fetch('/api/ai-profiles?adminOnly=true');
            const data = await response.json();
            const found = data.profiles?.find((p: AIModel) => p.id === parsed.id);
            if (found) { setCharacter(found); setLoadingCharacter(false); return; }
          }
        }
        const response = await fetch('/api/ai-profiles?adminOnly=true');
        const data = await response.json();
        const found = data.profiles?.find((p: AIModel) => createSlug(p.name) === slug);
        if (found) setCharacter(found);
      } catch (err) { console.error('Error fetching character:', err); }
      setLoadingCharacter(false);
    };
    fetchCharacter();
  }, [slug]);

  const toggleSelect = (setter: React.Dispatch<React.SetStateAction<number[]>>, arr: number[], id: number) => {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const buildFullPrompt = (): string => {
    const parts: string[] = [];
    selectedVetements.forEach(id => { const img = vetementsImages.find(i => i.id === id); if (img) parts.push(img.label); });
    selectedActions.forEach(id => { const img = actionsImages.find(i => i.id === id); if (img) parts.push(img.label); });
    selectedPoses.forEach(id => { const img = posesImages.find(i => i.id === id); if (img) parts.push(img.label); });
    selectedAccessoires.forEach(id => { const img = accessoiresImages.find(i => i.id === id); if (img) parts.push(img.label); });
    selectedScenes.forEach(id => { const img = scenesImages.find(i => i.id === id); if (img) parts.push(img.label); });
    if (textareaContent.trim()) parts.push(textareaContent.trim());
    return parts.join(', ');
  };

  const generateSingleImage = async (): Promise<string> => {
    if (!character) throw new Error('Personnage non trouvé');

    const customPrompt = buildFullPrompt();

    const response = await fetch('/api/aliveai/generate-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: character.name,
        gender: character.gender || 'femmes',
        age: character.age || 25,
        ethnicities: character.ethnicities || ['Occidental'],
        hairType: character.hair_type || 'straight',
        hairColor: character.hair_color || 'brown',
        eyeColor: character.eye_color || 'brown',
        bodyType: character.body_type || 'slim',
        chestSize: character.chest_size || 'medium',
        personality: character.personality,
        customPrompt: customPrompt,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur de génération');

    const { promptId } = data;

    let attempts = 0;
    const maxAttempts = 60;
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`/api/aliveai/generate-character?promptId=${promptId}`);
      const statusData = await statusRes.json();

      if (statusData.status === 'completed' && statusData.imageUrl) {
        return statusData.imageUrl;
      } else if (statusData.status === 'failed') {
        throw new Error('La génération a échoué');
      }
      attempts++;
    }

    throw new Error('Timeout: la génération a pris trop de temps');
  };

  const handleGenerate = async () => {
    if (!character) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImages([]);
    setCurrentImageIndex(0);

    try {
      const vetementsLabels = selectedVetements.map(id => vetementsImages.find(img => img.id === id)?.label || '');
      const actionsLabels = selectedActions.map(id => actionsImages.find(img => img.id === id)?.label || '');
      const posesLabels = selectedPoses.map(id => posesImages.find(img => img.id === id)?.label || '');
      const accessoiresLabels = selectedAccessoires.map(id => accessoiresImages.find(img => img.id === id)?.label || '');
      const scenesLabels = selectedScenes.map(id => scenesImages.find(img => img.id === id)?.label || '');

      const generatedImageUrls: string[] = [];

      for (let i = 0; i < imageCount; i++) {
        setGenerationProgress(`Génération de l'image ${i + 1}/${imageCount}...`);
        
        try {
          const imageUrl = await generateSingleImage();
          generatedImageUrls.push(imageUrl);
          
          await supabase.from('image_generations').insert([{
            user_id: null,
            vetements_names: vetementsLabels,
            actions_names: actionsLabels,
            poses_names: posesLabels,
            accessoires_names: accessoiresLabels,
            scenes_names: scenesLabels,
            image_url: imageUrl,
            image_count: imageCount,
            description: textareaContent,
            ai_model_id: character.id,
            image_index: i,
            batch_id: Date.now().toString(),
          }]);
          
          setGeneratedImages([...generatedImageUrls]);
          
        } catch (err) {
          if (generatedImageUrls.length === 0) {
            throw err;
          } else {
            console.warn(`Échec pour l'image ${i + 1}, mais ${generatedImageUrls.length} images ont été générées`);
          }
        }
      }

      setGenerationProgress('');
      if (generatedImageUrls.length === 0) {
        throw new Error('Aucune image n\'a pu être générée');
      }

    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === generatedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? generatedImages.length - 1 : prev - 1
    );
  };

  if (loadingCharacter) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <span className="ml-4 text-gray-400">Chargement du personnage...</span>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen flex flex-col items-center justify-center">
          <p className="text-xl text-gray-400 mb-4">Personnage non trouvé</p>
          <Link href="/generer" className="text-red-500 hover:underline">Retour à la sélection</Link>
        </div>
      </div>
    );
  }

  const imgSrc = character.avatar_url || '/images/mock.png';
  const imgName = character.name;
  const hasGeneratedImages = generatedImages.length > 0;
  const currentImageUrl = hasGeneratedImages ? generatedImages[currentImageIndex] : null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen relative">
        {/* User Icon */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
            <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
          </div>
        </div>

        {/* Title and mode */}
        <div className="flex items-center gap-22 mb-8">
          <h1 className="text-3xl font-bold font-montserrat">Générateur</h1>
          {!hasGeneratedImages && (
            <div className="flex gap-11">
              {['image', 'video'].map((m) => (
                <button key={m} onClick={() => setMode(m as 'image' | 'video')} className="relative text-sm font-medium group focus:outline-none">
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                  <span className={`absolute left-0 -bottom-1 w-full h-[2px] ${mode === m ? 'bg-red-600' : 'bg-transparent'} transition-colors`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main image + textarea + results */}
        <div className={`flex gap-6 ${hasGeneratedImages ? 'mb-4 items-start' : 'mb-10'}`}>
          {/* Image du personnage à gauche (toujours visible) */}
          <div className="rounded-3xl overflow-hidden relative w-1/3">
            <Image src={imgSrc} alt={imgName || ''} width={400} height={400} className="object-cover rounded-3xl" />
            <div className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-start p-4" style={{ background: 'linear-gradient(180.83deg, rgba(0, 0, 0, 0.087) -8.53%, rgba(0, 0, 0, 0.58) 99.29%)' }}>
              <span className="text-white text-3xl font-bold font-montserrat">{imgName || 'Personnage'}</span>
            </div>
          </div>

          {/* Textarea et résultats */}
          <div className={`relative flex flex-col ${hasGeneratedImages ? 'w-1/3' : 'w-2/3'}`}>
            <textarea
              value={textareaContent}
              onChange={(e) => setTextareaContent(e.target.value)}
              placeholder="Décrivez la scène souhaitée..."
              className={`p-4 pt-10 pl-12 rounded-4xl bg-white/10 text-white resize-none ${hasGeneratedImages ? 'w-full h-[317px]' : 'w-160 h-[311px]'}`}
              disabled={isGenerating}
            />
            <div className="absolute top-6 left-6 pointer-events-none">
              <Image src="/icons/edit.png" alt="Icône" width={29} height={28} style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(88%)' }} />
            </div>
            
            {generationProgress && (
              <div className="mt-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                <span className="text-gray-400">{generationProgress}</span>
              </div>
            )}
            
            {generationError && (
              <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded-xl text-red-400 text-sm">{generationError}</div>
            )}
          </div>

          {/* Zone d'affichage des images générées */}
          {hasGeneratedImages && currentImageUrl && (
            <div className="w-1/3 flex flex-col items-start">
              <h3 className="text-white text-xl font-bold mb-2">
                Images Générées ({generatedImages.length})
              </h3>
              
              <div className="rounded-3xl overflow-hidden relative" style={{ width: 240, height: 290 }}>
                <Image 
                  src={currentImageUrl} 
                  alt={`Image générée ${currentImageIndex + 1}`} 
                  fill 
                  className="object-cover rounded-3xl" 
                />
                
                {/* Navigation entre images si plus d'une */}
                {generatedImages.length > 1 && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <button 
                        onClick={handlePrevImage}
                        className="rounded-full p-2 hover: transition-colors z-20"
                      >
                        <Image src="/icons/back_arrow_ios.png" alt="Précédent" width={24} height={24} />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="rounded-full p-2 hover: transition-colors z-20"
                      > 
                        <Image src="/icons/arrow-right.png" alt="Suivant" width={33} height={33} />
                      </button>
                    </div> 
                    
                    {/* Indicateur de position */}
                    <div className="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-1 z-20">
                      <span className="text-white text-sm">
                        {currentImageIndex + 1}/{generatedImages.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Miniatures */}
             
          
              
              <p className="text-gray-400 text-sm mt-2">Cliquez pour télécharger ou partager</p>
            </div>
          )}
        </div>

        {/* Category links (masqué après génération) */}
        {!hasGeneratedImages && (
          <>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-white font-bold text-3xl">Actions</h2>
              <div className="flex gap-11 mr-84">
                {topLinks.map((link) => (
                  <button key={link} onClick={() => setActiveCategory(link)} className={`relative text-sm font-medium ${activeCategory === link ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                    {link}
                    <span className={`absolute left-0 -bottom-1 h-[2px] transition-all duration-300 ${activeCategory === link ? 'w-full bg-red-600' : 'w-0 group-hover:w-full bg-gray-600'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category components */}
            <div>
              {activeCategory === 'Vetements' && <Vetements selectedIds={selectedVetements} toggleSelect={(id) => toggleSelect(setSelectedVetements, selectedVetements, id)} />}
              {activeCategory === 'Actions' && <Actions selectedIds={selectedActions} toggleSelect={(id) => toggleSelect(setSelectedActions, selectedActions, id)} />}
              {activeCategory === 'Poses' && <Poses selectedIds={selectedPoses} toggleSelect={(id) => toggleSelect(setSelectedPoses, selectedPoses, id)} />}
              {activeCategory === 'Accessoires' && <Accessoires selectedIds={selectedAccessoires} toggleSelect={(id) => toggleSelect(setSelectedAccessoires, selectedAccessoires, id)} />}
              {activeCategory === 'Scenes' && <Scenes selectedIds={selectedScenes} toggleSelect={(id) => toggleSelect(setSelectedScenes, selectedScenes, id)} />}
            </div>
          </>
        )}

        {/* Number of images (only for image mode) */}
        {mode === 'image' && !hasGeneratedImages && (
          <>
            <h2 className="text-white font-bold text-2xl mb-6">Nombre d&apos;images</h2>
            <div className="flex gap-4 mb-8">
              {smallCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setImageCount(card.value)}
                  className={`flex items-center gap-2 w-[82px] h-[43px] rounded-xl p-2 justify-center transition-colors ${
                    imageCount === card.value ? 'bg-red-600' : 'bg-[rgba(87,87,87,1)] hover:bg-gray-600'
                  }`}
                >
                  <Image src={card.icon} alt="icon" width={17} height={11} />
                  <span className="text-white font-bold">{card.value}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Generate button */}
        <div className="flex justify-center mb-10">
          {hasGeneratedImages ? (
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setGeneratedImages([]);
                  setCurrentImageIndex(0);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Générer de nouvelles images
              </button>
              {/* <button 
                onClick={() => handleGenerate()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Générer à nouveau
              </button> */}
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition ${isGenerating ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isGenerating ? 'Génération en cours...' : `Générer ${imageCount} Image${imageCount > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GenerationSlugPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>}>
      <GenerationSlugContent slug={resolvedParams.slug} />
    </Suspense>
  );
}
