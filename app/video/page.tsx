'use client';

import Image from "next/image";
import Link from "next/link";

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: false, iconPath: '/images/iconmes.png', href: '/discuter' },
  { name: 'Collection', active: true, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: true, iconPath: '/images/chat.png', href: '/generer' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png', href: '/creer-modele' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png', href: '/mesia' },
];

const backItem = {
  name: 'Revenir dans myXplace',
  iconPath: '/icons/back_arrow.png',
  href: '/',
};

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>

    <nav className="space-y-3">
      {aiNavItems.map((item) => {
        const isActive = item.active;
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer ${
          isActive ? 'font-semibold' : 'text-gray-400 hover:text-white'
        }`;

        return (
          <Link href={item.href} key={item.name} className={classes}>
            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <div className="pt-6">
        <Link
          href={backItem.href}
          className="w-full flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer text-white hover:bg-red-600"
        >
          <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
          <span>{backItem.name}</span>
        </Link>
      </div>
    </nav>
  </div>
);

export default function VideoPage() {
  return (
    <div className="flex">
      <Sidebar />

      {/* CONTENU */}
      <div className="flex-1 ml-72 p-8 text-white bg-black min-h-screen relative">

        {/* ICONE UTILISATEUR EN HAUT À DROITE */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10">
            <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
          </div>
        </div>

        {/* TITRE + IMAGE PROFIL + NOM */}
        <div className="flex items-center gap-6 mb-10">
          <h1 className="text-4xl ml-6 font-bold font-montserrat">Ma collection </h1>
  <span className="text-3xl font-bold select-none">❯</span>
          <div className="flex items-center gap-4">
            <img
              src="/images/mock.png"
              className="w-14 h-14 rounded-full object-cover"
              alt="profile"
            />
            <span className="text-2xl font-semibold font-montserrat">
           Luna moreno
            </span>
          </div>
        </div>

        {/* IMAGES EN BAS */}
      <div className="grid grid-cols-2 gap-1 mt-8">

  {/* IMAGE 1 + Play icon */}
  <Link href="/popupvideo">
    <div
      className="relative cursor-pointer"
      style={{
        width: "203px",
        height: "240px",
        borderRadius: "16px",
        opacity: 1,
        animationDuration: "0ms",
      }}
    >
      <img
        src="/images/colection3.png"
        alt="img1"
        className="w-full h-full ml-6 object-cover rounded-xl"
      />

      {/* ICON PLAY AU CENTRE */}
<div className="absolute inset-0 flex justify-center items-center z-10">
  <div className="w-16 h-16 ml-9 flex justify-center items-center">
    <img
      src="/icons/playimage.png"  
      alt="Play Icon"
      className="w-10 h-10"  
    />
  </div>
</div>

    </div>
  </Link>

  {/* IMAGE 2 */}
  <Link href="/popup">
    <div
      className="relative cursor-pointer"
      style={{
        width: "203px",
        height: "240px",
        borderRadius: "16px",
        opacity: 1,
        animationDuration: "0ms",
      }}
    >
      <img
        src="/images/imagevideo.png"
        alt="img2"
        className="w-full h-full -ml-66 object-cover rounded-xl"
      />
    </div>
  </Link>

</div> 
</div>
    </div>
  );
}
