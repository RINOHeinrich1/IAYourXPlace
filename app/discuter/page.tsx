'use client'; 

import Image from 'next/image';
import Link from 'next/link'; 
import React, { useState } from 'react'; 

// --- DONNÉES DE NAVIGATION (Celles que vous avez demandées) ---
const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/' }, 
    { name: 'Discuter', active: true, iconPath: '/images/iconmes.png' }, // <--- ACTIVE DANS CETTE LISTE
    { name: 'Collection', active: false, iconPath: '/images/colec.png' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png' },
];

const backItem = { 
    name: 'Revenir dans myXplace', 
    iconPath: '/icons/back_arrow.png',
    href: '/', 
};

// --- DONNÉES POUR LES CHATS (Simplifiées pour l'exemple) ---
const chatListItems = [
    { id: 1, name: 'Elizabeth Garcia', lastMessage: 'vous: Hello', profileSrc: '/images/imgmes1.png', messages: [
        { sender: 'other', text: 'Hello' }, { sender: 'me', text: 'Hi' },
    ]},
    { id: 2, name: 'Nelly rn (1)', lastMessage: 'Hi honey 🍯', profileSrc: '/images/imgmes2.jpg', messages: [
        { sender: 'other', text: 'Salut !' },
    ]},
    { id: 3, name: 'Nelly rn (2)', lastMessage: 'vous: Hello girl', profileSrc: '/images/imgmes3.jpg', messages: [
        { sender: 'me', text: 'Coucou girl' },
    ]},
];


// --- Composant Sidebar (Utilise la propriété `active` des données) ---
const Sidebar = () => (
    <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50"> 
        <div className="mb-10 mt-2">
            <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
        </div>
        
        <nav className="space-y-3">
            {aiNavItems.map((item) => {
                // Utilise item.active directement
                const isActive = item.active; 
                const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer
                    ${isActive 
                        ? ' text-red-600 font-semibold' // Style actif
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
            
            {/* Élément "Revenir dans myXplace" (inchangé) */}
            <div className="pt-6">
                <Link 
                    href={backItem.href} 
                    className={`w-full flex items-center space-x-3 py-2 px-6 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600`}
                >
                    <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
                    <span>{backItem.name}</span>
                </Link>
            </div>
        </nav>
    </div>
);


// --- Composant Principal de la Page Discuter ---
export default function DiscuterPage() {
    // État pour gérer la conversation actuellement sélectionnée
    const [selectedChatId, setSelectedChatId] = useState(chatListItems[0].id);

    // Trouver la conversation et les messages actifs
    const activeChat = chatListItems.find(chat => chat.id === selectedChatId);
    const activeMessages = activeChat ? activeChat.messages : [];
    
    if (!activeChat) return null; 

    return (
       <div className="min-h-screen bg-black text-white">

  <Sidebar />

  <main className="ml-[299px] p-0 flex h-screen overflow-hidden">
   <h1 className="text-4xl font-bold mb-4 ml-9 mt-9">Discuter</h1>

    {/* Colonne Gauche Figma */}
    <div
      className="
        w-[320px] h-[522px]
        bg-black border border-[#252525]
        rounded-[32px]
        p-6
        flex flex-col
        mt-27
        -ml-36
      "
    >

   

      {/* Champ de recherche style Figma */}
      <div
        className="
          w-[167px] h-[44px]
          rounded-[32px]
          flex items-center gap-2
          px-5 py-[10px]
          mb-6
          bg-gradient-to-r from-white/25 to-white/10
        "
      >
        <input
          type="text"
          placeholder="Rechercher"
          className="bg-transparent text-white w-full focus:outline-none placeholder-white/60"
        />

        <Image
          src="/icons/search.png"
          alt="Search"
          width={20}
          height={20}
          className="cursor-pointer"
        />
      </div>

      {/* Liste des conversations */}
      <div className="space-y-2 overflow-y-auto custom-scrollbar-hide">
        {chatListItems.map((chat) => {
          const isActive = chat.id === selectedChatId;

          return (
           <div
  key={chat.id}
  onClick={() => setSelectedChatId(chat.id)}
  className={`
    flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition
    ${isActive ? '' : 'hover:bg-[#1e1e1e]/50'}
  `}
>
  <div className="w-[45px] h-[45px] rounded-full overflow-hidden flex-shrink-0">
    <Image
      src={chat.profileSrc}
      alt={chat.name}
      width={45}
      height={45}
      className="object-cover w-full h-full"
    />
  </div>

  <div>
    <h3 className="text-white font-semibold">{chat.name}</h3>
    <p className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
      {chat.lastMessage}
    </p>
  </div>
</div>

           
          );
        })}
      </div>

    </div>



               {/* 2. Colonne de Droite : Fenêtre de Chat Active */}
<div className="flex-1 bg-black p-0 flex flex-col">

    {/* Header du Chat Actif — plus petit + avatar rond */}
   {/* 2. Colonne de Droite : Fenêtre de Chat Active */}
<div className="flex-1 bg-black p-0 flex flex-col">

  {/* Fenêtre de Chat — légèrement plus bas + plus à droite */}
  <div className="w-[604px] h-[524px] bg-[#0A0A0A] border border-white/20 rounded-[32px]
                  p-5 flex flex-col justify-between
                  relative left-10 top-27">

    {/* --- TOP SECTION (image + icônes) --- */}
    <div>
      <div className="flex items-center justify-between">
        {/* Image principale */}
        <img
          src="/images/imgmes1.png"
          className="w-14 h-14 rounded-full object-cover"
          alt="profile"
        />

        {/* Icônes */}
        <div className="flex items-center space-x-4">
        <img
          src="/images/magic.png"
          className="w- h-7 rounded-full "
          alt="profile"
        />
          <button className="text-white text-xl">⋮</button>
          <img
          src="/images/vector.png"
          className="w-6 h-5 "
          alt="profile"
        />
        </div>
      </div>

      {/* --- LIGNE DE SÉPARATION --- */}
      <div className="w-full h-px bg-white/20 mt-4"></div>
    </div>

    {/* --- ZONE DE MESSAGES (CONVERSATION RÉELLE) --- */}
    <div className="flex-1 mt-4 text-gray-300 overflow-y-auto space-y-3">

      {/* Message reçu */}
      <div className="flex">
        <div className="max-w-[70%] bg-[#1E1E1E] px-4 py-2 rounded-xl">
          Salut ! Comment tu vas aujourd’hui ?
        </div>
      </div>

      {/* Message envoyé */}
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-red-600 px-4 py-2 rounded-xl text-white">
          Je vais bien merci ! Et toi ?
        </div>
      </div>

      {/* Message reçu */}
      <div className="flex">
        <div className="max-w-[70%] bg-[#1E1E1E] px-4 py-2 rounded-xl">
          Je travaille sur le design du chat, tu peux m’aider ?
        </div>
      </div>

      {/* Message envoyé */}
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-red-600 px-4 py-2 rounded-xl text-white">
          Oui totalement, envoie-moi ce que tu veux faire 😄
        </div>
      </div>

    </div>

    {/* --- INPUT + SEND BUTTON --- */}
   <div className="relative flex items-center mt-4">

  {/* INPUT avec padding à droite pour laisser place au bouton */}
  <input
    type="text"
    placeholder="Message…"
   className="flex-1 bg-[#1E1E1E] text-white p-3 pr-14 rounded-3xl outline-none"

  />

  {/* BUTTON DANS L’INPUT */}
  <button
    className="absolute right-3 w-9 h-9  flex items-center justify-center hover:bg-red-500"
  >
    <img src="/icons/send.png" className="w-5 h-5" alt="send" />
  </button>

</div>


  </div>

</div>

</div>
</main>

</div>
    );
}