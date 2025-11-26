'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const aiNavItems = [
  { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
  { name: 'Discuter', active: true, iconPath: '/images/iconmes.png' },
  { name: 'Collection', active: true, iconPath: '/images/colec.png', href: '/collection' },
  { name: 'Générer', active: false, iconPath: '/images/chat.png' },
  { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png' },
  { name: 'Mes IA', active: false, iconPath: '/images/mesia.png' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
}

const backItem = {
  name: 'Revenir dans myXplace',
  iconPath: '/icons/back_arrow.png',
  href: '/',
};

const chatListItems = [
  { id: 1, name: 'Elizabeth Garcia', lastMessage: 'vous: Hello', profileSrc: '/images/imgmes1.png' },
  { id: 2, name: 'Nelly rn (1)', lastMessage: 'Hi honey 🍯', profileSrc: '/images/imgmes2.jpg' },
  { id: 3, name: 'Nelly rn (2)', lastMessage: 'vous: Hello girl', profileSrc: '/images/imgmes3.jpg' },
];

const Sidebar = () => (
  <div className="w-77 fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50">
    <div className="mb-10 mt-2">
      <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    </div>
    <nav className="space-y-3">
      {aiNavItems.map((item) => {
        const isActive = item.active;
        const classes = `flex items-center space-x-3 py-2 px-6 rounded-lg cursor-pointer
            ${isActive ? '' : 'text-gray-400 hover:text-white'}`;
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

// --- DISCUSSION PAGE ---
export default function DiscuterPage() {
  const [selectedChatId, setSelectedChatId] = useState(chatListItems[0].id);
  const activeChat = chatListItems.find(chat => chat.id === selectedChatId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Erreur API');

      const data = await response.json();
      let assistantMessage: Message = data.choices[0]?.message;

      if (assistantMessage) {
        // Si le message contient le mot "image", on renvoie le mock image
        const isImage = assistantMessage.content.toLowerCase().includes("image");
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: isImage ? "mock" : assistantMessage.content,
            type: isImage ? "image" : "text",
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "⚠️ Je n'ai pas reçu de réponse valide de l'IA.", type: 'text' }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "💥 Erreur réseau ou serveur.", type: 'text' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  if (!activeChat) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <main className="ml-[299px] p-0 flex h-screen overflow-hidden">
        <h1 className="text-4xl font-bold mb-4 ml-9 mt-9">Discuter</h1>


        <div className="w-[320px] h-[522px] bg-black border border-[#252525] rounded-[32px] p-6 flex flex-col mt-27 -ml-36">
          <div className="w-[167px] h-[44px] rounded-[32px] flex items-center gap-2 px-5 py-[10px] mb-6 bg-gradient-to-r from-white/25 to-white/10">
            <input type="text" placeholder="Rechercher" className="bg-transparent text-white w-full focus:outline-none placeholder-white/60" />
            <Image src="/icons/search.png" alt="Search" width={20} height={20} className="cursor-pointer" />
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar-hide">
            {chatListItems.map(chat => (
              <div key={chat.id} onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition ${chat.id === selectedChatId ? '' : 'hover:bg-[#1e1e1e]/50'}`}>
                <div className="w-[45px] h-[45px] rounded-full overflow-hidden flex-shrink-0">
                  <Image src={chat.profileSrc} alt={chat.name} width={45} height={45} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{chat.name}</h3>
                  <p className={`text-sm ${chat.id === selectedChatId ? 'text-white' : 'text-gray-400'}`}>{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="flex-1 bg-black p-0 flex flex-col">

          <div className="w-[640px] h-[524px] bg-[#0A0A0A] border border-white/20 rounded-[32px] p-5 flex flex-col justify-between relative left-5 top-27">


            <div>
              <div className="flex items-center justify-between">

                <img
                  src="/images/imgmes1.png"
                  className="w-14 h-14 rounded-full object-cover"
                  alt="profile"
                />


                <div className="flex items-center space-x-4">
                  <img
                    src="/images/magic.png"
                    className="h-7 rounded-full"
                    alt="magic"
                  />
                  <button className="text-white text-xl">⋮</button>
                  <img
                    src="/images/vector.png"
                    className="w-6 h-5"
                    alt="options"
                  />
                </div>
              </div>

              <div className="w-159 h-px -ml-5 bg-white/20 mt-4"></div>

            </div>
            <div className="flex-1 mt-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex mb-2 ${msg.role === 'user' ? 'justify-start' : 'justify-end'} items-start`}>
                  {msg.role === 'user' && (
                    <>
                      <img src="/images/imgmes1.png" className="w-14 h-14 rounded-full object-cover mr-2" alt="profile" />
                      <div className="max-w-[70%] px-2 py-1 rounded-xl bg-[rgba(98,98,98,1)] text-white">{msg.content}</div>
                    </>
                  )}

                  {msg.role === 'assistant' && (
                    <div className="max-w-[70%] px-4 py-2 rounded-xl bg-[rgba(23,23,23,1)] text-white">
                      {msg.type === "image" ? (
                        <div className="w-40 h-40 relative">
                          <Image
                            src="/images/mock.png"
                            alt="Mock Image"
                            fill
                            style={{ objectFit: "cover", borderRadius: "12px" }}
                          />
                        </div>
                      ) : msg.content}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-end mb-2">
                  <div className="max-w-[70%] px-4 py-2 rounded-xl bg-[rgba(23,23,23,1)] text-white flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" /> En train d'écrire...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input + send */}
            <form onSubmit={sendMessage} className="relative flex items-center mt-4">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isLoading ? "Envoi du message..." : "Tapez votre message..."}
                disabled={isLoading}
                className="flex-1 bg-[rgba(98,98,98,0.6)] text-white p-3 pr-14 rounded-3xl outline-none backdrop-blur-[40px]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 w-9 h-9 flex items-center justify-center hover:bg-red-500 rounded-full"
              >
                {isLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Image src="/icons/send.png" alt="Envoyer" width={24} height={24} />
                }
              </button>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
}
