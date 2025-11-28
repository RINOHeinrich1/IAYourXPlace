'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react'; // Ajout de l'icône X
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
    reaction?: string; // NOUVEAU: Champ pour stocker la réaction
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

// Composant Sidebar (MIS À JOUR AVEC isCollapsed)
const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
    // Largeur dynamique : 299px vs 80px
    const sidebarWidthClass = isCollapsed ? 'w-[80px]' : 'w-[299px]';
    // Marge horizontale pour les éléments repliés
    const itemPaddingClass = isCollapsed ? 'px-0 justify-center' : 'px-6 space-x-3';

    // Contenu du logo dynamique
    const logoContent = isCollapsed ? (
        <Image src="/logo-icon.png" alt="X" width={44} height={44} className="mx-auto" /> // Utiliser une icône ou une version réduite du logo
    ) : (
        <Image src="/logo2.png" alt="my X place Logo" width={188} height={44} />
    );

    return (
        <div 
            className={`${sidebarWidthClass} fixed left-0 top-0 h-full bg-black text-white p-4 z-30 border-r border-solid border-gray-400/50 transition-all duration-300`}
        >
            <div className="mb-10 mt-2">
                {logoContent}
            </div>
            
            <nav className="space-y-3">
                {aiNavItems.map((item) => {
                    const isActive = item.active;
                    const classes = `flex items-center py-2 rounded-lg cursor-pointer transition-colors duration-300
                    ${itemPaddingClass}
                    ${isActive ? '' : 'text-gray-400 hover:text-white'}`;

                    const itemContent = (
                        <>
                            <Image src={item.iconPath} alt={`${item.name} Icon`} width={20} height={20} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </>
                    );

                    if (item.href) {
                        return (
                            <Link href={item.href} key={item.name} className={classes}>
                                {itemContent}
                            </Link>
                        );
                    }
                    return (
                        <div key={item.name} className={classes}>
                            {itemContent}
                        </div>
                    );
                })}

                <div className="pt-6">
                    <Link
                        href={backItem.href}
                        className={`w-full flex items-center py-2 transition-colors rounded-lg cursor-pointer text-white hover:bg-red-600 ${itemPaddingClass}`}
                    >
                        <Image src={backItem.iconPath} alt="Back Icon" width={20} height={20} />
                        {!isCollapsed && <span>{backItem.name}</span>}
                    </Link>
                </div>
            </nav>
        </div>
    );
};

// NOUVEAU COMPOSANT: Espace d'Image pour la Mini-Sidebar
const LargeImagePlaceholder = () => (
    <div 
        className="fixed top-0 right-0 h-full w-[calc(100vw-80px-320px-640px-80px)] bg-black/50 p-8 flex items-center justify-center transition-all duration-300"
        style={{ 
            // Positionnement et largeur pour occuper l'espace libre à droite
            // 80 (mini sidebar) + 40 (marge) + 320 (chat list) + 40 (marge) + 640 (chat box) = 1120px
            left: `calc(80px + 40px + 320px + 40px + 640px)`, 
            width: `calc(100vw - 1120px)`, 
            minWidth: '200px'
        }}
    >
        <div 
            className="w-full h-full bg-gray-900 rounded-3xl flex items-center justify-center overflow-hidden"
            style={{ 
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Remplacez '/images/large_background_ai.jpg' par le chemin de votre image */}
            <Image 
                src="/images/large_background_ai.jpg" 
                alt="Espace pour contenu visuel ou publicitaire" 
                layout="fill"
                objectFit="cover"
                className='opacity-70'
            />
             <div className="absolute text-white text-3xl font-bold bg-black/50 p-4 rounded-xl z-10">
                Espace Libre (Contenu IA / Pub)
            </div>
        </div>
    </div>
);


// --- DISCUSSION PAGE ---
export default function DiscuterPage() {
    // NOUVEAU: État pour gérer la sidebar
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
    
    // Largeur de la sidebar (ajustée aux classes ci-dessus: 299px vs 80px)
    const sidebarWidth = isSidebarCollapsed ? 80 : 299;


    const [selectedChatId, setSelectedChatId] = useState(chatListItems[0].id);
    const activeChat = chatListItems.find(chat => chat.id === selectedChatId);

    const [messages, setMessages] = useState<Message[]>([
        // Votre tableau de messages initial (vide ou avec messages de test)
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [replyTo, setReplyTo] = useState<number | null>(null);
    const clearReply = () => setReplyTo(null); // Fonction pour fermer l'aperçu

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    // *** FONCTION sendMessage CONSERVÉE INTACTE ***
    // (Utilise votre logique d'API /api/chat)
    const sendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const userMessage: Message = { role: 'user', content: input.trim(), type: 'text', time: currentTime };

        // Stocker le message de réponse pour l'historique ou l'API si nécessaire
        const replyInfo = replyTo !== null ? { repliedToContent: messages[replyTo].content, repliedToRole: messages[replyTo].role } : {};

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        clearReply(); // IMPORTANT: Cache l'aperçu de la réponse après l'envoi

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envoyer l'historique et le message de l'utilisateur (incluant l'info de réponse si nécessaire)
                body: JSON.stringify({ 
                    messages: [...messages, userMessage], 
                    replyInfo: replyInfo 
                }), 
            });

            if (!response.ok) throw new Error('Erreur API');

            const data = await response.json();
            let assistantMessage: Message = data.choices[0]?.message;

            if (assistantMessage) {
                const isImage = assistantMessage.content.toLowerCase().includes("image");
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: isImage ? "mock" : assistantMessage.content,
                        type: isImage ? "image" : "text",
                        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: "⚠️ Je n'ai pas reçu de réponse valide de l'IA.", type: 'text', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
                ]);
            }
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "💥 Erreur réseau ou serveur.", type: 'text', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [input, messages, isLoading, replyTo]); // Ajout de replyTo comme dépendance

    // *** FIN sendMessage INTACTE ***

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

    // Gère le clic droit (ou l'appui long) pour ouvrir la popup
    const handleContextMenu = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        toggleMenu(index);
    };

    // Logique pour ajouter la réaction au message
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
        setOpenMenuIndex(null); // Ferme le menu après la sélection
    };


    // NOUVEAU: Composant Aperçu de Réponse (Reply Preview)
    const ReplyPreview = () => {
        if (replyTo === null) return null;

        const repliedMessage = messages[replyTo];
        const isMe = repliedMessage.role === 'user';
        // Utiliser le nom du chat actif (l'autre personne) si le message est de 'assistant'
        const repliedToName = isMe ? "vous-même" : activeChat.name;

        return (
            <div
                className="w-full bg-black/50 p-4 flex justify-between items-center z-10 mx-auto"
                style={{
                    width: '640px',
                    height: '99px',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(0deg, rgba(16,16,16,0.9) 0%, rgba(30,30,30,0.9) 100%)',
                    boxSizing: 'border-box',
                }}
            >
                <div className="flex flex-col overflow-hidden w-full h-full justify-center">
                    <span className={`font-semibold text-sm ${isMe ? 'text-green-400' : 'text-blue-400'}`}>
                        Réponse à {repliedToName}
                    </span>
                    <p className="text-gray-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis mt-1">
                        {repliedMessage.content}
                    </p>
                </div>
                <button 
                    onClick={clearReply} 
                    className="text-white hover:text-red-500 transition ml-4 flex-shrink-0 p-2 rounded-full hover:bg-white/10"
                >
                    <X size={20} /> {/* Icône croix */}
                </button>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-black text-white">
            <Sidebar isCollapsed={isSidebarCollapsed} /> {/* Passage de l'état */}
            
            {/* Marge dynamique pour le contenu principal */}
            <main className={`p-0 flex h-screen overflow-hidden transition-all duration-300`} 
                style={{ marginLeft: `${sidebarWidth + 40}px` }} 
            >
                <h1 className="text-4xl font-bold mb-4 ml-9 mt-9">Discuter</h1>

                {/* Section Liste de Chat (laissé -ml-36 pour aligner avec le style initial) */}
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

                    {/* Conteneur principal du chat */}
                    <div className="w-[640px] h-[524px] bg-[#0A0A0A] border border-white/20 rounded-[32px] p-5 flex flex-col justify-between relative left-5 top-27">


                        {/* Entête du chat */}
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
                                    
                                    {/* ACTIVATION DE LA MINI-SIDEBAR ICI (bascule) */}
                                    <img
                                        src="/images/vector.png"
                                        className="w-6 h-5 cursor-pointer"
                                        alt="options"
                                        onClick={toggleSidebar} 
                                    />
                                </div>
                            </div>
                            <div className="w-159 h-px -ml-5 bg-white/20 mt-4"></div>
                        </div>


                        {/* Zone des messages (reste inchangée) */}
                        <div className="flex-1 mt-4 overflow-y-auto space-y-3">
                            {messages.map((msg, idx) => {
                                const isMe = msg.role === "user";
                                const isMenuOpen = openMenuIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        {/* Avatar pour assistant */}
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
                                                                    setOpenMenuIndex(null); // Ferme le menu après avoir cliqué sur Répondre
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

                                        {/* Avatar pour user */}
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


                        {/* NOUVEAU: APERÇU DE LA RÉPONSE (Reply Preview) */}
                        <ReplyPreview />

                        {/* Input + send */}
                        <form onSubmit={sendMessage} className="relative flex items-center">
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
            
            {/* NOUVEAU: Afficher l'image lorsque la sidebar est repliée */}
            {isSidebarCollapsed && <LargeImagePlaceholder />}
        </div>
    );
}