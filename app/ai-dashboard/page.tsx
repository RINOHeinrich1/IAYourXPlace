'use client'; 

import Image from 'next/image';
import Link from 'next/link'; 

// --- DONNÉES AI (Basé sur ia.jpg) ---
const aiNavItems = [
    { name: 'Home', active: true, iconPath: '/images/home.png', href: '/ai-dashboard' },
    { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
    { name: 'Collection', active: false, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const liveModels = [
    { name: 'Regina', src: '/images/Group.png' }, 
    { name: 'Esther', src: '/images/Groupa.png' },
    { name: 'Colleen', src: '/images/Group.png' },
    { name: 'Dianne', src: '/images/Groupa.png' },
];

const aiCharacters = [

    { id: 1, src: "/images/A.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "Donec sed erat ut magna suscipit mattis..." },
    { id: 2, src: "/images/B.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "Donec sed erat ut magna suscipit mattis..." },
    { id: 3, src: "/images/C.png", name: "Lara Croft AI", hasConsoleIcon: true, hasNewIcon: true, slug: "lara-croft-ai", phrase: "Donec sed erat ut magna suscipit mattis..." }, // 🌟 Image 3 : Console ET Nouveau
    { id: 4, src: "/images/D.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
    { id: 5, src: "/images/E.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: true, slug: "lara-croft-ai", phrase: "La Force est avec lui" }, // 🌟 Image 5 : Nouveau SEULEMENT
    { id: 6, src: "/images/F.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
    { id: 7, src: "/images/G.jpg", name: "Lara Croft AI", hasConsoleIcon: true, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" }, // 🌟 Image 7 : Console SEULEMENT
    { id: 8, src: "/images/H.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
    { id: 9, src: "/images/I.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
    { id: 10, src: "/images/J.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
    { id: 11, src: "/images/K.jpg", name: "Lara Croft AI", hasConsoleIcon: true, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" }, // 🌟 Image 11 : Console SEULEMENT
    { id: 12, src: "/images/L.jpg", name: "Lara Croft AI", hasConsoleIcon: false, hasNewIcon: false, slug: "lara-croft-ai", phrase: "La Force est avec lui" },
];

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
return(
 <div className="min-h-screen bg-black text-white">
<Sidebar />
 <Header />

 {/* Main Content Area: ml-[240px] correspond à la largeur de la Sidebar */}
      <main className={`ml-[240px] pt-7 p-8`}>

        {/* Section Live Models */}
 <section className="mb-12">
    <div 
            // Masque la barre de défilement et permet le défilement horizontal
            className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar-hide"
          >
            
            {liveModels.map((model, index) => (
              <div 
                key={index} 
                // Taille réduite pour afficher plus de cartes sans scrollbar (si l'écran est assez grand)
                className="flex-shrink-0 w-56 h-72 rounded-xl overflow-hidden cursor-pointer relative"
              >
                <Image src={model.src} alt={model.name} layout="fill" objectFit="cover" className="object-cover"/>
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white  to-transparent">
                  <Image 
            src={'/icons/liveai.png'} /* **À REMPLACER** */
            alt="Icône Public"
            width={26} 
            height={26} 
            // Positionne l'icône dans le coin supérieur droit
            className="absolute top-2 right-2 rounded-full z-10" 
        />
                  <h3 className="text-xl font-bold">{model.name}</h3>
                   <Link href="/live-action">
  <Image src="/icons/console.png" alt="Game icon" width={52} height={30} />
</Link>
                </div>
              </div>
            ))}
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
    
   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
     mx-[39px]  /* MARGE GAUCHE/DROITE (Horizontal) : Rétablie à 6 (large) */
    gap-y-9   /* MARGE HAUT/BAS (Vertical) : Diminuée à 3 (serré) */
    mt-8">
        {aiCharacters.map((character) => (
  <Link
    key={character.id}
    href="/profil"  // ← redirection vers une page statique
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
                                    <Image 
                                        src="/icons/console.png" 
                                        alt="Game icon" 
                                        width={52} 
                                        height={30} 
                                    />
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
</section>
        
      </main>
    </div>
  );
}