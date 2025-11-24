import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react'; 
import Link from 'next/link';

// --- 1. Données pour la navigation ---
const navItems = [
  { name: 'Home', active: true, iconPath: '/images/home.png' }, 
  { name: 'VOD', active: false, iconPath: '/images/video.png' },
  { name: 'Social discovery', active: false, iconPath: '/images/social.png' },
  { name: 'Reels', active: false, iconPath: '/images/reel.png' },
  { name: 'Live', active: false, iconPath: '/images/live.png' },
  // L'icône AI est un GIF
 { name: 'MyModel AI', active: false, iconPath: '/images/iagif.gif', isGif: true, href: '/ai-dashboard' }, 
];

// --- NOUVELLE DONNÉE : Carrousel Principal (Grandes Images) ---
const mainCarouselImages = [
    '/images/Frame1.png', // Remplacez par vos chemins d'images
    '/images/Framerbleu.png',
    '/images/Framerrose.png',
];


// --- Composant Principal de la Page ---
export default function NextJsInterface() {

  // --- 1. Composant Sidebar (Intégré) ---
  // --- 1. Composant Sidebar (Intégré) ---
const Sidebar = () => (
    <div className="w-64 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 
                    border-r border-solid border-gray-400/50"> 
        
        {/* Logo Image */}
        <div className="mb-10 mt-2">
            <Image 
                src="/logo.png" 
                alt="my X place Logo" 
                width={188} 
                height={44} 
            />
        </div>
        
        {/* Navigation Items CORRIGÉS */}
        <nav className="space-y-3">
            {navItems.map((item) => {
                // Le contenu de l'élément (icône + nom)
                const content = (
                    <>
                        {/* 🟢 GESTION DES IMAGES (PNG/GIF) 🟢 */}
                        {item.isGif ? (
                            // Utilisation de <img> pour le GIF + bg-black pour masquer le fond
                            <div className="w-5 h-5 flex items-center justify-center bg-black">
                                <img 
                                    src={item.iconPath} 
                                    alt={`${item.name} Icon`} 
                                    width={20} 
                                    height={20} 
                                    className="object-contain" 
                                />
                            </div>
                        ) : (
                            // Utilisation de Image de Next.js pour les PNG/JPG
                            <Image
                                src={item.iconPath} 
                                alt={`${item.name} Icon`} 
                                width={20} 
                                height={20} 
                            />
                        )}
                        <span>{item.name}</span>
                    </>
                );

                // Classes Tailwind (CORRECTION: Ajout de bg-red-600 pour l'état actif)
                const classes = `flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer
                    ${item.active 
                        ? 'text-white font-semibold' // CORRIGÉ: Ajout de bg-red-600 ici
                        : 'text-gray-400 hover:text-white hover:bg-neutral-800'}`;

                // Rendu conditionnel: Utiliser <Link> si 'href' est défini (pour MyModel AI)
                if (item.href) {
                    return (
                        <Link 
                            href={item.href} // Ceci est '/ai-dashboard'
                            key={item.name} 
                            className={classes} // Applique les classes CSS au lien
                        >
                            {content}
                        </Link>
                    );
                }

                // Rendu par défaut: Utiliser <div> pour les autres éléments
                return (
                    <div key={item.name} className={classes}>
                        {content}
                    </div>
                );
            })}
        </nav>
    </div>
);
  // --- 2. Composant Header (Intégré) ---
 // --- 2. Composant Header (Intégré) ---
const Header = () => (
    <header className="fixed top-0 left-64 right-0 z-20 p-4 bg-black/80 backdrop-blur-sm">
      
        {/* Ligne 1: Barre de recherche et icônes de profil */}
        <div className="flex justify-between items-start mb-4">
            
            {/* Ligne 1 GAUCHE: Search Bar */}
            <div className="relative w-[706px] h-[48px] flex items-center">
                <input
                    type="text"
                    placeholder="Rechercher"
                    className="w-full h-full bg-neutral-800 text-white pl-4 pr-12 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <Search className="absolute right-4 text-gray-400 cursor-pointer" size={20} />
            </div>

            {/* Ligne 1 DROITE: Icônes de Profil (Conteneur Flex Row) */}
            <div className="flex items-center space-x-4"> 
                {/* Placeholders pour les 3 Icônes Personnalisées du Header */}
                {['/images/iconmes.png', '/images/iconnotif.png', '/images/iconuser.png'].map((iconSrc, index) => (
                    <div key={index} className="relative cursor-pointer">
                    <Image
                        src={iconSrc} 
                        alt={`Header Icon ${index + 1}`} 
                        width={28} 
                        height={28} 
                        className="rounded-full"
                    />
                    {/* Badge de notification (uniquement pour les deux premières icônes) */}
                    {index < 2 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full text-xs flex items-center justify-center font-bold border-2 border-black">
                        {index === 0 ? '2' : '3'}
                        </span>
                    )}
                    </div>
                ))}
            </div>
        </div>

        {/* Ligne 2: Bouton "All", Carrousel d'Images (Petites Cartes) et Bouton "Categories" */}
        <div className="flex justify-between items-center mb-2"> 
            
            {/* Ligne 2 GAUCHE: Dropdown 'All' et Carrousel */}
            <div className="flex items-center space-x-4">
                 {/* Dropdown 'All' */}
                <button className="flex items-center space-x-1 bg-neutral-800 text-gray-300 px-3 py-2 rounded-lg hover:bg-neutral-700 transition-colors">
                    All <ChevronDown size={16} />
                </button>

               
            </div>
            
            {/* Ligne 2 DROITE: Categories Button (maintenant aligné à droite) */}
            <button className="flex items-center space-x-1 text-white font-semibold bg-neutral-800 px-3 py-2 rounded-lg hover:bg-neutral-700 transition-colors">
                Categories <ChevronDown size={16} />
            </button>
        </div>

    </header>
);


  // --- Rendu de la Page ---
  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <Header />
      
      {/* Main Content Area: PT-44 pour tenir compte du header plus grand */}
      
           {/* Main Content Area: PT-44 pour tenir compte du header plus grand */}
<main className="ml-64 pt-44 p-8">

    {/* 🏆 CARROUSEL PRINCIPAL (GRANDES IMAGES) : CORRIGÉ sans barre de défilement 🏆 */}
    <section 
        // overflow-x-auto permet le défilement.
        // scrollbar-hide (ou un CSS personnalisé équivalent) masque la barre de défilement.
        className="flex space-x-6 overflow-x-auto pb-6 custom-scrollbar-hide" 
    >
        {mainCarouselImages.map((imgSrc, index) => (
             <div 
                key={index} 
                className="flex-shrink-0 w-[480px] h-[350px] rounded-xl overflow-hidden cursor-pointer bg-neutral-800"
            >
                <Image 
                    src={imgSrc} 
                    alt={`Main Banner ${index + 1}`} 
                    width={480}
                    height={350} 
                    objectFit="cover"
                    className="flex items-center justify-center text-4xl text-white/50"
                />
            </div>
        ))}
    </section>
    
    {/* Indicateurs de carrousel (les points) */}
    <div className="flex justify-center space-x-2 mt-4 mb-10">
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
    </div>

    {/* Section Top Tendency */}
    <section>
      <h2 className="text-3xl font-bold mb-6">Top tendency</h2>
      <div className="h-64 border border-neutral-800 p-4 rounded-xl text-neutral-500">
         Vos cartes de tendance iront ici...
      </div>
    </section>
    
</main>
    </div>
  );
}