'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- DONNÉES AI (Basé sur ia.jpg) ---
const aiNavItems = [
    { name: 'Home', active: true, iconPath: '/images/home.png', href: '/ai-dashboard' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

// liveModels removed - now using liveActionCharacters filtered from AI models

// Interface for AI models fetched from the database
interface AIModel {
    id: string;
    name: string;
    description?: string;
    personality?: string;
    avatar_url?: string;
    created_at: string;
    created_by: string;
}


const backItem = { 
    name: 'Revenir dans myXplace', 
    iconPath: '/icons/back_arrow.png',
    href: '/', 
};


// --- Composant Sidebar (Mode AI) ---
const Sidebar = () => (
    <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50"> 
        <div className="mb-10 mt-2">
            <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
        </div>
        
       <nav className="space-y-3">
            {aiNavItems.map((item) => {
                const isActive = item.name === 'Home'; 
                const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer
                    ${isActive 
                        ? ' text-white font-semibold' 
                        : 'text-gray-400 hover:text-white '}`;

                if (item.href) {
                     return (
                         <Link href={item.href} key={item.name} className={classes}>
                             <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                             <span>{item.name}</span>
                         </Link>
                     );
                }

                return (
                    <div key={item.name} className={classes}>
                         <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                        <span>{item.name}</span>
                    </div>
                );
            })}
            
            {/* Élément "Revenir dans myXplace" */}
            <div className="pt-6">
                <Link 
                    href={backItem.href} 
                    className={`w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer  text-white hover:bg-red-600`}
                >
                    <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
                    <span>{backItem.name}</span>
                </Link>
            </div>
        </nav>
    </div>
);

const Header = () => (
    <header className=" right-0 z-20 p-4 bg-black/80 backdrop-blur-sm h-[80px]">
        <div className="flex flex-col justify-between items-start h-full">
           <div className="w-full flex justify-end">
   <div 
        className="
            flex items-center justify-center /* Centre l'icône à l'intérieur du div */
            w-[45px] h-[45px]             /* Définit la taille du cercle de la bordure (plus grand que l'icône) */
            rounded-full                  /* Rend le div parfaitement rond */
            border-1                      /* Épaisseur de la bordure (2px) */
            border-white                  /* Couleur de la bordure (Blanc) */
            mt-3 
            bg-white/10
            mr-8                         /* Marge supérieure pour déplacer vers le bas */
        "
    >    <Image 
            src={'/images/iconuser.png'} 
            alt="User Icon" 
            width={20}           
            height={20}
           
        />
    </div>
</div>
            {/* Ligne du bas : Titre aligné à gauche (par défaut) et centré verticalement par items-center */}
            <div className="flex items-center mt-8">
                <h1 className="text-4xl font-bold text-red-600  ml-80">
                    Se lancer dans <span className=" text-white              /* Couleur du texte : Blanc */
        text-xl 
        font-bold 
        px-4
        py-2
      font-montserrat
        rounded-[16px]          
        mx-2 
        border-2                
        border-white   ">EN DIRECT</span> <span className="text-white">Action</span>
                </h1>
            </div>
        </div>
    </header>
);


// --- Composant Principal de la Page AI ---
export default function AiDashboardPage() {
    const [aiCharacters, setAiCharacters] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Handler to navigate to live-action with character data
    const handleLiveActionClick = (character: { id: string; name: string; src: string; slug: string; phrase: string }) => {
        localStorage.setItem('liveActionCharacter', JSON.stringify({
            id: character.id,
            name: character.name,
            avatar_url: character.src,
            slug: character.slug,
            description: character.phrase
        }));
        router.push('/live-action');
    };

    useEffect(() => {
        const fetchAdminAI = async () => {
            try {
                // Fetch AI models created by admin users
                const response = await fetch('/api/ai-profiles?adminOnly=true');
                if (response.ok) {
                    const data = await response.json();
                    setAiCharacters(data.models || []);
                }
            } catch (error) {
                console.error('Error fetching AI models:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminAI();
    }, []);

    // Define the display character interface
    interface DisplayCharacter {
        id: string;
        src: string;
        name: string;
        hasConsoleIcon: boolean;
        hasNewIcon: boolean;
        slug: string;
        phrase: string;
    }

    // Helper function to generate deterministic random icon flags based on model id
    // Uses a simple hash to ensure consistent icon display for each character
    const getIconFlags = (id: string): { hasConsoleIcon: boolean; hasNewIcon: boolean } => {
        // Create a simple hash from the id string
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        // Use hash to determine icon flags (4 possible combinations)
        const iconPattern = Math.abs(hash) % 4;
        switch (iconPattern) {
            case 0: return { hasConsoleIcon: true, hasNewIcon: true };   // Both icons
            case 1: return { hasConsoleIcon: true, hasNewIcon: false };  // Camera only
            case 2: return { hasConsoleIcon: false, hasNewIcon: true };  // Microphone only
            case 3: return { hasConsoleIcon: false, hasNewIcon: false }; // No icons
            default: return { hasConsoleIcon: true, hasNewIcon: true };
        }
    };

    // Convert AIModel to display format - NO FALLBACK DATA, only real database models
    // Icons vary randomly across characters based on their unique ID
    const displayCharacters: DisplayCharacter[] = aiCharacters.map((model, index) => {
        const iconFlags = getIconFlags(model.id);
        return {
            id: model.id,
            src: model.avatar_url || `/images/${String.fromCharCode(65 + (index % 12))}.jpg`,
            name: model.name,
            hasConsoleIcon: iconFlags.hasConsoleIcon,
            hasNewIcon: iconFlags.hasNewIcon,
            slug: model.name.toLowerCase().replace(/\s+/g, '-'),
            phrase: model.description || model.personality || 'Une IA créée par les administrateurs'
        };
    });

    // Filter characters for "Se lancer dans EN DIRECT Action" section
    // Only show first 4 characters that have ONLY the console/camera icon (no microphone)
    const liveActionCharacters = displayCharacters
        .filter(char => char.hasConsoleIcon === true && char.hasNewIcon === false)
        .slice(0, 4);

return(
 <div className="min-h-screen bg-black text-white">
<Sidebar />
 <Header />

 {/* Main Content Area: ml-[240px] correspond à la largeur de la Sidebar */}
      <main className={`ml-[240px] pt-7 p-8`}>

        {/* Section Se lancer dans EN DIRECT Action - Shows only AI models with console icon only */}
 <section className="mb-12 ml-17">
  <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar-hide">
    {liveActionCharacters.length > 0 ? (
      liveActionCharacters.map((model) => (
        <div
          key={model.id}
          className="flex-shrink-0 w-56 h-72 rounded-xl overflow-hidden relative"
        >
          {/* Image principale redirige vers Profil */}
          <Link
            href={`/profil/${model.slug}?id=${model.id}`}
            className="relative block w-full h-full z-0"
          >
            <Image
              src={model.src}
              alt={model.name}
              fill
              style={{ objectFit: 'cover' }}
              className="object-cover"
            />
          </Link>

          <div className="absolute inset-0 p-4 flex flex-col justify-end text-white to-transparent z-10 pointer-events-none">
            <Image
              src={'/icons/liveai.png'}
              alt="Icône Public"
              width={26}
              height={26}
              className="absolute top-2 right-2 rounded-full pointer-events-auto"
            />

            <h3 className="text-xl font-bold ml-2 mb-2 pointer-events-none">{model.name}</h3>

            {/* Console redirige vers Live */}
            <button
              onClick={() => handleLiveActionClick(model)}
              className="mt-2 ml-2 pointer-events-auto cursor-pointer"
            >
              <Image
                src="/icons/console.png"
                alt="Game icon"
                width={52}
                height={30}
              />
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-400">Aucun modèle disponible pour cette section</p>
    )}
  </div>
</section>
        {/* Section Personnages myModèle AI */}
        <section>
    <div className="flex items-center -mt-5">
        {/* Titre et état EN DIRECT */}
        <h1 className="text-4xl font-bold text-red-600 font-montserrat ml-17">
            Personnages <span className="text-white">myModèle AI</span>
        </h1>
    </div>

    {loading ? (
        <div className="flex items-center justify-center py-16">
            <p className="text-xl text-gray-400">Chargement des modèles IA...</p>
        </div>
    ) : displayCharacters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 mx-[39px]">
            <p className="text-xl text-gray-400 mb-4">Aucun modèle IA créé par les administrateurs.</p>
            <p className="text-sm text-gray-500">Les modèles IA créés par les administrateurs apparaîtront ici.</p>
        </div>
    ) : (
   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
     mx-[39px]  /* MARGE GAUCHE/DROITE (Horizontal) : Rétablie à 6 (large) */
    gap-y-9   /* MARGE HAUT/BAS (Vertical) : Diminuée à 3 (serré) */
    mt-8">
        {displayCharacters.map((character) => (
  <Link
    key={character.id}
    href={`/profil/${encodeURIComponent(character.slug)}?id=${character.id}`}
    className="
      ml-8
      h-68 rounded-xl overflow-hidden cursor-pointer relative shadow-lg
      block
      w-[90%] mx-auto
      hover:scale-[1.03] transform transition-transform duration-300
    "
  >
            {/* Image de fond du personnage */}
            <Image
                src={character.src}
                alt={character.name}
                layout="fill"
                objectFit="cover"
                className="object-cover"
            />

            {/* Conteneur de superposition pour les infos en bas */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end text-white bg-black/30 hover:bg-black/50 transition-all duration-300">
                {/* ... Contenu du texte et des icônes ... */}
                <h3 className="text-lg font-bold">{character.name}</h3>
                <p className="text-sm text-white/90 truncate">
                    {character.phrase}
                </p>
                <div className="flex space-x-1 mt-1 text-sm text-white/80">
               {character.hasConsoleIcon && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleLiveActionClick(character);
                                        }}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <Image
                                            src="/icons/console.png"
                                            alt="Game icon"
                                            width={52}
                                            height={30}
                                        />
                                    </button>
                                )}

                                {/* Icône 2 : NOUVELLE ICÔNE (Affichée si hasNewIcon est Vrai) */}
                                {character.hasNewIcon && (
                                    <Image
                                        src="/icons/micro.png"
                                        alt="New Icon"
                                        width={52}
                                        height={30}
                                    />


                )}
                </div>
            </div>
        </Link>
    ))}
</div>
    )}
</section>
        
      </main>
    </div>
  );
}