'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Reply, Share2, Pin, Trash2, Undo2 } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';

// --- Les définitions de constantes restent inchangées ---

const aiNavItems = [
    { name: 'Home', active: false, iconPath: '/images/home.png', href: '/ai-dashboard' },
    { name: 'Discuter', active: true, iconPath: '/images/iconmes.png' },
    { name: 'Collection', active: true, iconPath: '/images/colec.png', href: '/collection' },
    { name: 'Générer', active: false, iconPath: '/images/chat.png' },
    { name: 'Créer un modèle IA', active: false, iconPath: '/images/crer.png' },
    { name: 'Mes IA', active: false, iconPath: '/images/mesia.png' },
];

// Extended message interface for UI state
interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'image';
    time: string;
    reaction?: string;
    reply_to_id?: string;
}

const backItem = {
    name: 'Revenir dans myXplace',
    iconPath: '/icons/back_arrow.png',
    href: '/',
};

// Default chat items for demo (will be replaced by database conversations)
const defaultChatItems = [
    { id: '1', name: 'Elizabeth Garcia', lastMessage: 'vous: Hello', profileSrc: '/images/imgmes1.png' },
    { id: '2', name: 'Nelly rn (1)', lastMessage: 'Hi honey 🍯', profileSrc: '/images/imgmes2.jpg' },
    { id: '3', name: 'Nelly rn (2)', lastMessage: 'vous: Hello girl', profileSrc: '/images/imgmes3.jpg' },
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
    // Use the chat hook for database-backed conversations
    const {
        messages: dbMessages,
        conversations,
        currentConversation,
        availableModels,
        isSending,
        sendMessage: sendDbMessage,
        deleteMessage: deleteDbMessage,
        updateReaction: updateDbReaction,
        deleteConversation,
        selectConversation,
        startConversation,
    } = useChat();

    // Transform DB messages to UI messages format
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const uiMessages: Message[] = dbMessages.map(msg => ({
            id: msg.id,
            role: msg.role || 'user', // Default to 'user' if role is undefined
            content: msg.content || '',
            type: msg.content_type === 'image' ? 'image' : 'text',
            time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            reaction: msg.reaction,
            reply_to_id: msg.reply_to_id,
        }));
        setMessages(uiMessages);
    }, [dbMessages]);

    // Build chat list from conversations or available AI models
    // Support both ai_model and ai_profile for backward compatibility
    const chatListItems = conversations.length > 0
        ? conversations.map(conv => {
            const aiProfile = conv.ai_model || conv.ai_profile;
            const lastMsgContent = conv.last_message?.content || '';
            return {
                id: conv.id,
                name: aiProfile?.name || 'IA',
                lastMessage: conv.last_message
                    ? `${conv.last_message.role === 'user' ? 'vous: ' : ''}${lastMsgContent.substring(0, 30)}...`
                    : 'Nouvelle conversation',
                profileSrc: aiProfile?.avatar_url || '/images/imgmes1.png',
                isConversation: true,
                modelId: undefined as string | undefined,
            };
        })
        : availableModels.length > 0
            ? availableModels.map(model => ({
                id: model.id,
                name: model.name,
                lastMessage: 'Démarrer une conversation',
                profileSrc: model.avatar_url || '/images/imgmes1.png',
                isConversation: false,
                modelId: model.id,
            }))
            : defaultChatItems.map(item => ({ ...item, isConversation: false, modelId: undefined }));

    const [selectedChatId, setSelectedChatId] = useState<string>(chatListItems[0]?.id || '1');
    const activeChat = chatListItems.find(chat => chat.id === selectedChatId) || chatListItems[0];

    const [input, setInput] = useState('');
    const isLoading = isSending;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // ÉTAT POUR LA RÉPONSE
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const clearReply = () => setReplyTo(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    // Auto-select first conversation when conversations load
    useEffect(() => {
        if (conversations.length > 0 && !currentConversation) {
            const firstConv = conversations[0];
            setSelectedChatId(firstConv.id);
            selectConversation(firstConv.id);
        }
    }, [conversations, currentConversation, selectConversation]);

    // Handle conversation or AI model selection
    const handleSelectConversation = useCallback(async (chatId: string) => {
        setSelectedChatId(chatId);
        const selectedItem = chatListItems.find(item => item.id === chatId);

        if (selectedItem?.isConversation) {
            // Select existing conversation
            await selectConversation(chatId);
        } else if (selectedItem?.modelId) {
            // Start new conversation with AI model
            await startConversation(selectedItem.modelId);
        }
    }, [chatListItems, selectConversation, startConversation]);

    const sendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const replyToId = replyTo !== null && messages[replyTo]?.id ? messages[replyTo].id : undefined;

        clearReply();
        const messageContent = input.trim();
        setInput('');

        // Always use database-backed sending when we have a conversation
        if (currentConversation?.id) {
            await sendDbMessage(messageContent, replyToId);
        } else {
            // No conversation selected - show a message to select an AI model first
            const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "⚠️ Veuillez sélectionner un modèle IA dans la liste pour commencer une conversation.", type: 'text', time: currentTime }
            ]);
        }
    }, [input, messages, isLoading, replyTo, currentConversation, sendDbMessage]);

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
    const handleReaction = async (idx: number, emoji: string) => {
        const message = messages[idx];
        const currentReaction = message.reaction;
        const newReaction = currentReaction === emoji ? null : emoji;

        // Update local state immediately for responsiveness
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[idx] = { ...newMessages[idx], reaction: newReaction || undefined };
            return newMessages;
        });

        // If we have a message ID, persist to database
        if (message.id) {
            await updateDbReaction(message.id, newReaction);
        }

        setOpenMenuIndex(null); // Ferme le menu après la sélection
    };

    // Handle message deletion
    const handleDeleteMessage = async (idx: number) => {
        const message = messages[idx];
        if (message.id) {
            const success = await deleteDbMessage(message.id);
            if (success) {
                setMessages(prev => prev.filter((_, i) => i !== idx));
            }
        } else {
            // For local messages without DB ID
            setMessages(prev => prev.filter((_, i) => i !== idx));
        }
        setOpenMenuIndex(null);
    };

    // Handle conversation deletion
    const handleDeleteConversation = async () => {
        if (currentConversation?.id) {
            await deleteConversation(currentConversation.id);
        }
    };


    // MODIFIÉ: Composant Aperçu de Réponse (Reply Preview)
    const ReplyPreview = () => {
        if (replyTo === null) return null;

        const repliedMessage = messages[replyTo];
        const isMe = repliedMessage.role === 'user';
        // Utiliser le nom du chat actif (l'autre personne) si le message est de 'assistant'
        const repliedToName = isMe ? "vous-même" : activeChat.name;

        return (
            <div
                // MODIFIÉ: Retrait de bg-black/50
                className="w-full p-4 mt-6 flex justify-between items-center z-10 mx-auto"
                style={{
                    width: '590px', // MODIFIÉ: Largeur raccourcie
                    height: '99px',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    borderWidth: '1px',
                 
                    borderStyle: 'solid',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    // MODIFIÉ: Suppression du background inline
                    boxSizing: 'border-box',
                }}
            >
                <div className="flex flex-col overflow-hidden w-full h-full justify-center">
                    {/* MODIFIÉ: Couleur du texte mise en blanc */}
                    <span className="font-semibold text-sm text-white"> 
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
                   <img
    src="/icons/close.png"
    className="w-6 h-6 cursor-pointer"
    alt="close icon"
/>

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
                            <div key={chat.id} onClick={() => handleSelectConversation(chat.id)}
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
                                    {/* <img
                                        src="/images/magic.png"
                                        className="h-7 rounded-full"
                                        alt="magic"
                                    /> */}
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


                        {/* Zone des messages */}
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
                                        {/* Bulle + Réaction + Popup */}
<div className="relative max-w-[320px] flex flex-col">
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

    {/* Réaction sous le message */}
    {msg.reaction && (
        <div className="mt-1 text-xl">
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

                                                    {/* Message sélectionné pour aperçu */}
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
                                                            <div
                                                                className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10"
                                                                onClick={() => handleDeleteMessage(idx)}
                                                            >
                                                                <Trash2 size={16} />
                                                                <span>Supprimer pour vous</span>
                                                            </div>
                                                            <div
                                                                className="flex items-center gap-2 p-1 rounded-lg cursor-pointer text-[#e95a5a] hover:bg-white/10"
                                                                onClick={handleDeleteConversation}
                                                            >
                                                                <Undo2 size={16} className="text-red-400" />
                                                                <span>Supprimer la conversation</span>
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
        </div>
    );
}