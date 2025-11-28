'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react'; // Ajout de l'icône X (croix)
import { Reply, Share2, Pin, Trash2, Undo2 } from 'lucide-react';

// --- Les définitions de constantes restent inchangées ---

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
    time: string;
    reaction?: string;
    // NOUVEAU: Pour la réponse, on pourrait stocker l'index ou l'ID du message original.
    // Pour cet exercice, on va juste stocker le contenu du message si c'est une réponse,
    // mais le code de base n'en a pas besoin, seul le `replyTo` state suffit.
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

    const [messages, setMessages] = useState<Message[]>([
        { role: 'user', content: "Bonjour, comment ça va ?", type: 'text', time: '13:10' },
        { role: 'assistant', content: "Je vais bien, merci ! Et vous ?", type: 'text', time: '13:11' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // NOUVEAU STATE POUR LA RÉPONSE
    const [replyTo, setReplyTo] = useState<number | null>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const clearReply = () => setReplyTo(null);

    const sendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // NOUVEAU: Ajoutez l'info de la réponse au message s'il y a lieu (non implémenté côté API mock, mais utile pour l'affichage)
        const replyMessageContent = replyTo !== null ? messages[replyTo].content : undefined;

        const userMessage: Message = { role: 'user', content: input.trim(), type: 'text', time: currentTime };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        clearReply(); // IMPORTANT: Efface l'aperçu de la réponse après l'envoi

        // --- Reste du code d'envoi (Mock ou API) ---
        // ... (Logique API simplifiée ou mockée) ...
        setTimeout(() => {
            const assistantMessage: Message = { 
                role: 'assistant', 
                content: `J'ai bien reçu votre message : "${userMessage.content}"`, 
                type: 'text', 
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) 
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);

    }, [input, messages, isLoading, replyTo]); // Assurez-vous d'inclure replyTo dans les dépendances si vous l'utilisez plus tard

    if (!activeChat) return null;


    const reactions = [
        { emoji: "❤️", alt: "Coeur" },
        { emoji: "😢", alt: "Triste" },
        { emoji: "😂", alt: "Mort de rire" },
        { emoji: "😮", alt: "Surpris" },
        { emoji: "😡", alt: "En colère" },
        { emoji: "👍", alt: "Pouce levé" },
        { emoji: "➕", alt: "Plus" }
    ];

    const toggleMenu = useCallback((index: number) => {
        setOpenMenuIndex(prevIndex => (prevIndex === index ? null : index));
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        toggleMenu(index);
    };

    const handleReaction = (idx: number, emoji: string) => {
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const currentReaction = newMessages[idx].reaction;

            if (currentReaction === emoji) {
                newMessages[idx].reaction = undefined;
            } else {
                newMessages[idx].reaction = emoji;
            }

            return newMessages;
        });
        setOpenMenuIndex(null);
    };

    // Composant Aperçu de Réponse (ajusté pour correspondre au style demandé)
    const ReplyPreview = () => {
        if (replyTo === null) return null;

        const repliedMessage = messages[replyTo];
        const isMe = repliedMessage.role === 'user';
        const repliedToName = isMe ? "vous-même" : activeChat.name;

        return (
            <div
                className="w-full bg-[#1b1b1b] p-3 flex justify-between items-center z-10"
                style={{
                    width: '640px',
                    height: '99px',
                    top: '592px',
                    left: '744px',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    borderWidth: '1px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxSizing: 'border-box',
                }}
            >
                <div className="flex flex-col overflow-hidden w-full">
                    <span className={`font-semibold text-sm ${isMe ? 'text-green-400' : 'text-blue-400'}`}>
                        Réponse à {repliedToName}
                    </span>
                    <p className="text-gray-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis mt-1">
                        {repliedMessage.content}
                    </p>
                </div>
                <button onClick={clearReply} className="text-white hover:text-red-500 transition ml-4 flex-shrink-0">
                    <X size={20} /> {/* Icône croix */}
                </button>
            </div>
        );
    };


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
                                className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition ${chat.id === selectedChatId ? 'bg-white/10' : 'hover:bg-[#1e1e1e]/50'}`}>
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
                            {messages.map((msg, idx) => {
                                const isMe = msg.role === "user";
                                const isMenuOpen = openMenuIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        {/* Avatar */}
                                        {!isMe && (
                                            <img
                                                src="/images/imgmes1.png"
                                                className="w-12 h-12 rounded-full object-cover mr-2"
                                                alt="assistant"
                                            />
                                        )}

                                        {/* Bulle + Popup */}
                                        <div className="relative max-w-[320px]">
                                            <div
                                                onContextMenu={(e) => handleContextMenu(e, idx)}
                                                onClick={() => toggleMenu(idx)}
                                                className={`px-4 py-2 rounded-2xl text-white cursor-pointer`}
                                                style={{ background: isMe ? "rgba(23,23,23,1)" : "rgba(98,98,98,1)" }}
                                            >
                                                {msg.type === "image" ? (
                                                    <div className="w-40 h-40 relative">
                                                        <Image
                                                            src="/images/mock.png"
                                                            alt="Mock Image"
                                                            fill
                                                            className="object-cover rounded-xl"
                                                        />
                                                    </div>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>

                                            {/* Réaction visible */}
                                            {msg.reaction && (
                                                <div
                                                    className="absolute text-xl rounded-full p-[2px] shadow-lg border-2 border-black bg-[#1b1b1b]"
                                                    style={{
                                                        bottom: '-10px',
                                                        right: isMe ? '0px' : 'auto',
                                                        left: isMe ? 'auto' : '0px',
                                                    }}
                                                >
                                                    {msg.reaction}
                                                </div>
                                            )}


                                            {isMenuOpen && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute z-50 rounded-xl shadow-xl p-3 w-[280px] flex flex-col"
                                                    style={{
                                                        top: "-110px",
                                                        left: isMe ? "auto" : "-10px",
                                                        right: isMe ? "-10px" : "auto",
                                                        background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                                                        backdropFilter: "blur(10px)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                    }}
                                                >
                                                    {/* Réactions */}
                                                    <div className="flex flex-wrap justify-between mb-2 gap-1">
                                                        {reactions.map((r) => (
                                                            <div
                                                                key={r.emoji}
                                                                className={`text-2xl cursor-pointer hover:scale-125 transition ${
                                                                    msg.reaction === r.emoji ? "bg-white/30 rounded-full p-1" : ""
                                                                    }`}
                                                                onClick={() => handleReaction(idx, r.emoji)}
                                                            >
                                                                {r.emoji}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Message sélectionné à droite avec style personnalisé */}
                                                    <div className="w-full flex justify-end">
                                                        <div
                                                            className="text-white text-sm flex items-center"
                                                            style={{
                                                                background: "rgba(23, 23, 23, 1)",
                                                                width: "114px",
                                                                height: "26px",
                                                                borderRadius: "32px",
                                                                padding: "5px 10px",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                    </div>


                                                    {/* Heure + Actions */}
                                                    <div
                                                        className="flex flex-col gap-1 p-2 rounded mt-2"
                                                        style={{ background: "rgba(56,56,56,1)" }}
                                                    >
                                                        {/* Heure à gauche */}
                                                        <div className="text-left text-white text-[10px]">
                                                            {msg.time}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-1 text-sm mt-1">
                                                            <div
                                                                className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10"
                                                                onClick={() => {
                                                                    setReplyTo(idx);
                                                                    setOpenMenuIndex(null); // Ferme le menu
                                                                }}
                                                            >
                                                                <Reply size={16} />
                                                                <span>Répondre</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10">
                                                                <Share2 size={16} />
                                                                <span>Transférer</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10">
                                                                <Pin size={16} />
                                                                <span>Épingler</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10">
                                                                <Trash2 size={16} />
                                                                <span>Supprimer pour vous</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer text-[#e95a5a] hover:bg-white/10">
                                                                <Undo2 size={16} className="text-red-400" />
                                                                <span>Retirer</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}



                                        </div>
                                        {isMe && (
                                            <img
                                                src="/images/user.png"
                                                className="w-12 h-12 rounded-full object-cover ml-2"
                                                alt="me"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>


                        {/* NOUVEAU: APERÇU DE LA RÉPONSE */}
                        <ReplyPreview />

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