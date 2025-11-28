'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

interface Profile {
  name: string;
  age: number;
  ethnicities: string[];
  hair_type: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  chest_size: string;
  personality: string[];
  relationship: string[];
  profession: string[];
  sexual_preferences: string[];
  voice: string;
}

interface SidebarProps {
  currentPagePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPagePath }) => {
  const aiNavItems = [
    { name: 'Home', iconPath: '/images/home.png', href: '/' },
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
    <div className="w-[17rem] fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
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
  bgColor?: string; // <- nouvelle prop
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  label,
  value,
  iconSrc,
  isHighlighted = false,
  size = 'default',
  showIcon = true,
  bgImage,
  bgColor, // <- récupéré ici
}) => (
  <div
    className={`flex flex-col justify-end relative overflow-hidden rounded-lg transition duration-300 ease-in-out hover:shadow-lg
      ${isHighlighted ? 'shadow-red-500/30' : 'bg-gray-800'}
      ${size === 'small' ? 'p-2 min-h-[70px] w-[210px]' : 'p-3 min-h-[100px] w-[150px]'}`}
    style={{
      background: bgColor ? bgColor : bgImage ? `url(${bgImage}) center/cover no-repeat` : undefined,
    }}
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



export default function SummaryPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appearance' | 'personality'>('appearance');

  const router = useRouter();
  const currentPath = router.pathname || '';

  const profileImageUrl = '/images/cheuveux10.png';

  const iconMap: { [key: string]: string } = {
    ethnicities: '/icons/globe.png',
    age: '/icons/calendar.png',
    eye_color: '/icons/eye.png',
    body_type: '/icons/body.png',
    chest_size: '/icons/chest.png',
    hair_type: '/icons/hair_type.png',
    hair_color: '/icons/hair_color.png',
    personality: '/icons/emotion.png',
    relationship: '/icons/heart.png',
    sexual_preferences: '/icons/sexual.png',
    voice: '/icons/voice.png',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<Profile>('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) console.error('Erreur Supabase :', error);
      else if (data && data.length > 0) setProfile(data[0]);
      else
        setProfile({
          name: 'Elizabeth Garcia',
          age: 22,
          ethnicities: ['Occidental'],
          hair_type: 'Lisse',
          hair_color: 'Rose',
          eye_color: 'Bleu',
          body_type: 'Moyenne',
          chest_size: 'Forte (D)',
          personality: ['Ambitieuse', 'Créative', 'Joyeuse'],
          relationship: ['Célibataire'],
          profession: ['Étudiante'],
          sexual_preferences: ['Hétérosexuelle'],
          voice: 'Femme chaleureuse',
        } as Profile);

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading)
    return <p className="text-center p-10 bg-black text-white min-h-screen">Chargement...</p>;
  if (!profile)
    return <p className="text-center p-10 bg-black text-white min-h-screen">Aucune donnée disponible.</p>;

  const MainContent = () => (
    <div className="flex-1 p-10 ml-[17rem] bg-black text-white min-h-screen flex justify-center">
      <div className="max-w-4xl w-full flex space-x-8">
 {/* Image Profil */}
        <div className="w-1/3 flex justify-center flex-shrink-0">
          <div className="w-[330px] h-[575px] overflow-hidden rounded-xl bg-gray-800 shadow-2xl relative">
            <Image
              src={profileImageUrl}
              alt={`Profil de ${profile.name}`}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

      

        {/* Infos / Cartes */}
        <div className="w-2/3 space-y-6 flex flex-col">
          {/* Nom et profession toujours en haut */}
          <div>
            <h2 className="text-3xl font-bold">{profile.name}, {profile.age}</h2>
            <div className="text-gray-400 mt-1 flex items-center space-x-2">
              <span className="inline-block px-3 py-1  text-sm font-medium">
                {profile.profession.length ? profile.profession[0] : 'Non spécifié'}
              </span>
            </div>
          </div>

          {/* Onglets alignés à gauche */}
  <div className="flex space-x-3 mt-4">
    <button
      onClick={() => setActiveTab('appearance')}
      className={`w-[137px] h-[44px] rounded-[32px] flex items-center justify-center gap-[10px] 
        px-[20px] py-[10px] text-white font-semibold transition duration-200
        ${activeTab === 'appearance' ? 'bg-[rgba(217,26,42,1)]' : 'bg-[rgba(87,87,87,1)]'}`}
    >
      Apparence
    </button> 
    <button
      onClick={() => setActiveTab('personality')}
      className={`w-[137px] h-[44px] rounded-[32px] flex items-center justify-center gap-[10px] 
        px-[20px] py-[10px] text-white font-semibold transition duration-200
        ${activeTab === 'personality' ? 'bg-[rgba(217,26,42,1)]' : 'bg-[rgba(87,87,87,1)]'}`}
    >
      Personnage
    </button>
  </div>
          {/* Apparence */}
         {activeTab === 'appearance' && (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-x-2 gap-y-2 justify-start">
   <ProfileCard
  label="Ethnicité"
  value={profile.ethnicities[0] || 'N/A'}
  iconSrc={iconMap.ethnicities}
  size="small"
  bgImage="/images/colection3.png"
/>



<ProfileCard
  label="Âge"
  value={`${profile.age} ans`}
  isHighlighted
  size="small"
  showIcon={false}
  bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
/>

  <ProfileCard
      label="Type de yeux"
      value={profile.eye_type || 'N/A'}
      size="small"
      bgImage="/images/yeux1.png" // image de fond spécifique pour le type
      showIcon={false}
    /> 
    <ProfileCard 
      label="Type de corps" 
      value={profile.body_type} 
      isHighlighted 
      iconSrc={iconMap.body_type} 
      size="small"
    />
    <ProfileCard 
      label="Taille de poitrine" 
      value={profile.chest_size} 
      iconSrc={iconMap.chest_size} 
      size="small"
    />
    <ProfileCard 
      label="Coiffure" 
      value={profile.hair_type} 
      iconSrc={iconMap.hair_type} 
      bgImage="/images/cheuveux6.png"// image de fond spécifique pour le type
     
      size="small"
    />
    <ProfileCard 
      label="Couleur de cheveux" 
      value={profile.hair_color} 
      iconSrc={iconMap.hair_color}
       bgImage="/images/imgmes1.png" // image de fond spécifique pour le type
     
      size="small"
    />
  </div>
)}


          {/* Personnage */}
{activeTab === 'personality' && (
  <div className="grid grid-cols-2 md:grid-cols-2 gap-2 justify-start">
    <ProfileCard 
      label="Nom" 
      value={profile.name} 
      isHighlighted
      size="small"
      showIcon={false}
      bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
    />
   
    <ProfileCard
      label="Personnalité"
      value={profile.personality.join(', ')}
      isHighlighted
      size="small"
      showIcon={false}
      bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
    />
    <ProfileCard 
      label="Relations" 
      value={profile.relationship[0] || 'N/A'} 
      size="small"
      showIcon={false}
      bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
    />
    <ProfileCard 
      label="Profession" 
      value={profile.profession[0] || 'N/A'} 
      size="small"
      showIcon={false}
      bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
    />
    <ProfileCard
      label="Penchants sexuels"
      value={profile.sexual_preferences.join(', ')}
      size="small"
      showIcon={false}
      bgColor="radial-gradient(80.88% 649.74% at 25.37% 25.74%, #0C0C0C 0%, #875555 100%)"
    />
     <ProfileCard 
      label="Voix" 
      value={profile.voice} 
      size="small"
      showIcon={false}  
       bgImage="/images/voix.jpg"
    />
  </div>
)}


       <button
  className="w-[240px] py-3 mt-9 bg-red-600 text-white font-bold rounded-xl text-base"
  onClick={() => router.push('/creer-modele/activate-ai')} // <-- redirection
>
  Donner vie à mon IA
</button>

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
