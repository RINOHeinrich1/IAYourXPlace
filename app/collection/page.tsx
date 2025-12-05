'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: true, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = {
  name: 'Revenir dans myXplace',
  iconPath: '/icons/back_arrow.png',
  href: '/',
};

interface SubscribedCharacter {
  id: string;
  ai_model_id: string;
  ai_models: {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    personality?: string;
  };
}

interface CollectionItem {
  id: string;
  name: string;
  thumb: string;
  large: string;
  photos: number;
  videos: number;
  modelId: string;
}

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>

    <nav className="space-y-3">
      {aiNavItems.map((item) => {
        const isActive = item.active;
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${isActive ? ' font-semibold' : 'text-gray-400 hover:text-white'
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

export default function CollectionPage() {
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Static fallback items for when no subscriptions exist
  const fallbackItems: CollectionItem[] = [
    { id: '1', name: 'Luna Moreno', thumb: '/images/colection1.png', large: '/images/colection3.png', photos: 1, videos: 1, modelId: '' },
    { id: '2', name: 'Mila Mah', thumb: '/images/colection2.jpg', large: '/images/colection2.jpg', photos: 1, videos: 1, modelId: '' },
  ];

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscriptions/ai-character');
        if (response.ok) {
          const data = await response.json();
          const subscriptions: SubscribedCharacter[] = data.subscriptions || [];

          if (subscriptions.length > 0) {
            const items: CollectionItem[] = subscriptions.map((sub, index) => ({
              id: sub.id,
              name: sub.ai_models?.name || 'IA inconnue',
              thumb: sub.ai_models?.avatar_url || `/images/${String.fromCharCode(65 + (index % 12))}.jpg`,
              large: sub.ai_models?.avatar_url || `/images/${String.fromCharCode(65 + (index % 12))}.jpg`,
              photos: Math.floor(Math.random() * 50) + 1,
              videos: Math.floor(Math.random() * 10) + 1,
              modelId: sub.ai_model_id,
            }));
            setCollectionItems(items);
          } else {
            setCollectionItems(fallbackItems);
          }
        } else {
          setCollectionItems(fallbackItems);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setCollectionItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-77 p-8 text-white bg-black min-h-screen relative">
        {/* Icon utilisateur en haut à droite */}
        <div className="absolute top-4 right-4">

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

        {/* Titre */}
        <h1 className="text-3xl mt-22 font-bold mb-6">Ma collection</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xl text-gray-400">Chargement de votre collection...</p>
          </div>
        ) : collectionItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-gray-400 mb-4">Votre collection est vide</p>
            <p className="text-sm text-gray-500 mb-6">Abonnez-vous à des personnages IA pour les voir ici</p>
            <Link href="/ai-dashboard" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
              Découvrir les personnages IA
            </Link>
          </div>
        ) : (
        /* Miniatures et infos */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {collectionItems.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image
                  src={item.thumb}
                  alt={item.name}
                  width={66}
                  height={99}
                  className="rounded-md object-cover"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>

                  <div className="flex space-x-4 text-sm text-gray-300 items-center">

                    {/* Icône photo + chiffre */}
                    <div className="flex items-center space-x-1">
                      <Image
                        src="/icons/icon.png"
                        alt="Photo Icon"
                        width={18}
                        height={18}
                      />
                      <span>{item.photos}</span>
                    </div>

                    {/* Icône vidéo + chiffre */}
                    <div className="flex items-center space-x-1">
                      <Image
                        src="/icons/play.png"   // Tu peux changer l’icône ici
                        alt="Video Icon"
                        width={18}
                        height={18}
                      />
                      <span>{item.videos}</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Grande image avec bandeau centré */}
              <div className="relative w-[200px] h-[244px] rounded-xl">

                {/* Bandeau sous l'image, mais visible en haut */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-[173px] h-[40px] rounded-t-xl z-0"
                  style={{ background: 'rgba(67, 66, 66, 1)' }}
                />

                {/* Image devant - Link to character detail view with breadcrumb */}
                <Link
                  href={item.modelId ? `/video/${item.modelId}` : `/video`}
                  className="block relative w-full h-full"
                >
                  <Image
                    src={item.large}
                    alt={`${item.name} Grande image`}
                    fill
                    className="object-cover rounded-xl"
                  />
                </Link>

              </div>

            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
