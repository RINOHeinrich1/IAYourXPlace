'use client';

import { Sidebar, LargeImagePlaceholder } from './sidebar';
import TransferModal from './TransferModal';
import DropdownMenu from './DropdownMenu';
import MagicPopup from "./MagicPopup";
import UserMenuDropdown from '../components/UserMenuDropdown';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { Reply, Share2, Pin, Trash2, Undo2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'image';
    time: string;
    reaction?: string;
    reply?: { index: number; content: string; role: 'user' | 'assistant' } | undefined;
    pinned?: boolean;
    removed?: boolean;
}

const chatListItems = [
    { id: 1, name: 'Elizabeth Garcia', lastMessage: 'vous: Hello', profileSrc: '/images/imgmes1.png' },
    { id: 2, name: 'Nelly rn (1)', lastMessage: 'Hi honey 🍯', profileSrc: '/images/imgmes2.jpg' },
    { id: 3, name: 'Nelly rn (2)', lastMessage: 'vous: Hello girl', profileSrc: '/images/imgmes3.jpg' },
];

export default function DiscuterPage() {
    // Sidebar
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
    const sidebarWidth = isSidebarCollapsed ? 80 : 299;

    const [selectedChatId, setSelectedChatId] = useState(chatListItems[0].id);
    const activeChat = chatListItems.find(chat => chat.id === selectedChatId);

    //   usericon
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    // index of message currently hovered / showing reaction bar
    const [hoverReactionIndex, setHoverReactionIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // New states for share / undo stack
    const [shareModal, setShareModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
    const [undoStack, setUndoStack] = useState<Array<any>>([]);

    //   magicpopup
    const [showMagicPopup, setShowMagicPopup] = useState(false);



    const [replyTo, setReplyTo] = useState<number | null>(null);
    const clearReply = () => setReplyTo(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const sendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        // attach reply info into the message payload when replying
        const replyPayload = replyTo !== null ? { index: replyTo, content: messages[replyTo].content, role: messages[replyTo].role } : undefined;
        const userMessage: Message & { reply?: any } = { role: 'user', content: input.trim(), type: 'text', time: currentTime, reply: replyPayload };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        clearReply();

        try {
            // build the messages payload we send to the API
            const messagesForApi = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messagesForApi }),
            });

            if (!response.ok) throw new Error('Erreur API');

            const data = await response.json();
            let assistantMessage: Message = data.choices[0]?.message;

            if (assistantMessage) {
                const isImage = assistantMessage.content.toLowerCase().includes("image");
                // preserve the reply payload so assistant replies show the replied message
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: isImage ? "mock" : assistantMessage.content,
                        type: isImage ? "image" : "text",
                        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        reply: replyPayload,
                    }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: "⚠️ Je n'ai pas reçu de réponse valide de l'IA.", type: 'text', time: currentTime, reply: replyPayload }
                ]);
            }
        } catch {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "💥 Erreur réseau ou serveur.", type: 'text', time: currentTime }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [input, messages, isLoading, replyTo]);

    if (!activeChat) return null;

    const reactions = ["❤️", "😢", "😂", "😮", "😡", "👍", "➕"];

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

    const handleReaction = (index: number, reaction: string) => {
        setMessages(prev =>
            prev.map((msg, i) =>
                i === index
                    ? { ...msg, reaction }
                    : msg
            )
        );

        setOpenMenuIndex(null);
    };

    const handleReply = (idx: number) => {
        // open the reply preview and set reply target
        setReplyTo(idx);
        setOpenMenuIndex(null);
        // keep the page scrolled to bottom so the input area is visible
        setTimeout(() => scrollToBottom(), 60);
    };

    const handleShare = (idx: number) => {
        // open centered share modal for the selected message
        setShareModal({ open: true, index: idx });
        setOpenMenuIndex(null);
    };

    const handleRemoveForEveryone = (idx: number) => {
        // mark message as removed for everyone (keep in list but show placeholder)
        setMessages(prev => {
            const newMessages = [...prev];
            const old = newMessages[idx];
            if (!old) return prev;
            newMessages[idx] = { ...old, content: '', removed: true };
            setUndoStack(s => [...s, { type: 'remove', index: idx, message: old }]);
            return newMessages;
        });
        setOpenMenuIndex(null);
    };

    const handlePin = (idx: number) => {
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[idx] = { ...newMessages[idx], pinned: !newMessages[idx].pinned };
            return newMessages;
        });
        setOpenMenuIndex(null);
    };

    const handleDelete = (idx: number) => {
        // remove a message locally and push to undo stack
        setMessages(prev => {
            const toRemove = prev[idx];
            const newMessages = prev.filter((_, i) => i !== idx);
            setUndoStack(s => [...s, { type: 'delete', index: idx, message: toRemove }]);
            return newMessages;
        });
        setOpenMenuIndex(null);
    };

    const handleUndo = () => {
        // undo last action (only delete supported for now)
        setUndoStack(prev => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy.pop();
            if (!last) return copy;

            if (last.type === 'delete' || last.type === 'remove') {
                setMessages(p => {
                    const arr = [...p];
                    // restore message at the original index if possible
                    const idx = Math.min(Math.max(0, last.index), arr.length);
                    // if it was a 'remove' (placeholder) the current element may be the placeholder; replace it
                    if (last.type === 'remove' && arr[idx] && arr[idx].removed) {
                        arr[idx] = last.message;
                    } else {
                        arr.splice(idx, 0, last.message);
                    }
                    return arr;
                });
            }

            return copy;
        });
        setOpenMenuIndex(null);
    };

    const ReplyPreview = () => {
        if (replyTo === null) return null;
        const repliedMessage = messages[replyTo];
        const isMe = repliedMessage.role === 'user';
        const repliedToName = isMe ? "vous-même" : activeChat.name;

        return (
            <div
                className="w-[600px] h-[99px] mt-20 flex justify-between items-center z-10 mx-auto p-3 border border-white/20 rounded-t-2xl"
                style={{
                    background: 'linear-gradient(0deg, rgba(16,16,16,0.9) 0%, rgba(30,30,30,0.9) 100%)'
                }}
            >

                {/* Zone texte de réponse */}
                <div className="flex flex-col overflow-hidden w-full h-full justify-center">
                    <span className={`font-semibold text-sm ${isMe ? '' : ''}`}>
                        Réponse à {repliedToName}
                    </span>
                    <p className="text-gray-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis mt-1">
                        {repliedMessage.content}
                    </p>
                </div>

                {/* Boutons micro + cadeau */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {/* <button className="p-2 rounded-full hover:bg-white/10 transition">
            <img src="/icons/micro.png" alt="Micro" width={24} height={24} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition">
            <img src="/icons/gift.png" alt="Cadeau" width={24} height={24} />
          </button> */}

                    {/* Bouton fermer réponse */}
                    <button
                        onClick={clearReply}
                        className="text-white hover:text-red-500 transition p-2 rounded-full hover:bg-white/10"
                    >
                        <img src="/icons/close.png" alt="Fermer" width={20} height={20} />
                    </button>
                </div>
            </div>
        );


    };

    const handleScroll = () => {
        const page = document.getElementById('discuter-page');
        if (page) {
            page.style.overflowY = 'auto';
        }
    };

    useEffect(() => {
        handleScroll();
    }, [/* dependencies if any */]);

    // compute pinned and non-pinned indices (keep original array order and indices)
    const pinnedIndices = messages
        .map((m, i) => (m.pinned ? i : -1))
        .filter(i => i >= 0);

    const otherIndices = messages
        .map((m, i) => (!m.pinned ? i : -1))
        .filter(i => i >= 0);


    const handleResetChat = () => {
        console.log('Chat réinitialisé');
        // Ta logique pour réinitialiser le chat
    };

    const handleDeleteChat = () => {
        console.log('Chat supprimé');
        // Ta logique pour supprimer le chat
    };

    return (
        <div className="min-h-screen bg-black text-white flex" id="discuter-page">
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} />
            {/* Ici le DropdownMenu */}


            {/* Contenu principal */}
            <main
                className={`flex-1 flex flex-col p-6 transition-all duration-300 ${isSidebarCollapsed ? 'pr-0' : ''}`}
                style={{
                    marginLeft: `${sidebarWidth}px`,
                    minWidth: 0 // ← important pour empêcher le shrink quand scrollbar apparaît
                }}
            >

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center justify-center w-[45px] h-[45px] rounded-full border border-white bg-white/10 transition hover:bg-white/20 focus:outline-none
                   absolute top-[-10px] right-[10px] z-20"
                        aria-label="Menu utilisateur"
                    >
                        <Image src="/images/iconuser.png" alt="User Icon" width={20} height={20} />
                    </button>

                    <UserMenuDropdown isOpen={isMenuOpen} />
                </div>


                <h1 className="text-4xl font-bold mt-22 mb-6">Discuter</h1>

                <div className="flex gap-3 w-full overflow-x-hidden">
                    {/* Première card: chat list */}
                    <div
                        className="bg-[#0A0A0A] border border-white/20 rounded-[32px] p-5 flex flex-col transition-all duration-300 flex-shrink-0"
                        style={{
                            width: isSidebarCollapsed ? '300px' : '350px',
                            height: '524px'
                        }}
                    >
                        <div className="w-full h-[44px] rounded-[32px] flex items-center gap-2 px-5 py-[10px] mb-6 bg-gradient-to-r from-white/25 to-white/10">
                            <input type="text" placeholder="Rechercher" className="bg-transparent text-white w-full focus:outline-none placeholder-white/60" />
                            <Image src="/icons/search.png" alt="Search" width={20} height={20} className="cursor-pointer" />
                        </div>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar-hide flex-1">
                            {chatListItems.map(chat => (
                                <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition ${chat.id === selectedChatId ? 'bg-white/10' : 'hover:bg-[#1e1e1e]/50'}`}>
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

                    {/* Zone de discussion + image collée */}
                    <div className="flex flex-row items-start gap-0 flex-1 overflow-x-hidden">
                        {/* Zone de discussion */}
                        <div
                            className="bg-[#0A0A0A] border border-white/20 rounded-[32px] p-5 flex flex-col justify-between transition-all duration-300 flex-shrink-0"
                            style={{
                                width: isSidebarCollapsed ? '530px' : '630px',
                                height: '524px',
                                transition: 'width 0.3s ease',
                            }}
                        >

                            {/* Header discussion */}
                            <div className="flex items-center justify-between mb-4">
                                <img src="/images/imgmes1.png" className="w-14 h-14 rounded-full object-cover" alt="profile" />
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img
                                            src="/images/magic.png"
                                            className="h-7 rounded-full cursor-pointer"
                                            alt="magic"
                                            onClick={() => setShowMagicPopup(!showMagicPopup)}
                                        />

                                        <MagicPopup isOpen={showMagicPopup} />
                                    </div>

                                    <div className="relative" ref={menuRef}>
                                        <div className="flex justify-end">
                                            <DropdownMenu
                                                handleResetChat={handleResetChat}
                                                handleDeleteChat={handleDeleteChat}
                                            />
                                        </div>
                                        {/* ... Le menu qui s'affiche/se cache selon isMenuOpen ... */}
                                    </div>
                                    <Image
                                        // swapped mapping: when sidebar is collapsed (mini) show vector.png, when expanded show vector-close.png
                                        src={isSidebarCollapsed ? "/images/vector.png" : "/images/vector-close.png"}
                                        alt="Toggle Sidebar"
                                        width={26}
                                        height={24}
                                        className="cursor-pointer"
                                        onClick={toggleSidebar}
                                    />
                                </div>

                            </div>
                            <div className="w-full h-px bg-white/20 mt-4 mb-4"></div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {/* pinned messages (top) - keep original indices */}
                                {pinnedIndices.map(origIdx => {
                                    const msg = messages[origIdx];
                                    const isMe = msg.role === "user";

                                    return (
                                        <div key={`pinned-${origIdx}`} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                                            {!isMe && <img src="/images/imgmes1.png" className="w-12 h-12 rounded-full object-cover mr-2" alt="assistant" />}
                                            <div className="relative max-w-[320px]">
                                                <div className={`px-4 py-2 rounded-2xl cursor-pointer border border-yellow-400 bg-yellow-100/5 flex items-center gap-3`}>
                                                    <div className="w-12 h-12 bg-[#111] rounded-md flex items-center justify-center mr-2">{/* place pour image */}
                                                        {/* image placeholder - user can add later */}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-sm text-yellow-300 font-semibold"><Pin size={14} /> <span>Message épinglé</span></div>
                                                        <div className="text-white max-w-[420px] truncate mt-1">{msg.removed ? <span className="text-gray-400 italic">Vous avez retiré un message</span> : msg.content}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* {isMe && <img src="/images/user.png" className="w-12 h-12 rounded-full object-cover ml-2" alt="me" />} */}
                                        </div>
                                    );
                                })}

                                {/* remaining messages */}
                                {otherIndices.map(origIdx => {
                                    const msg = messages[origIdx];
                                    const isMe = msg.role === "user";
                                    const isMenuOpen = openMenuIndex === origIdx;
                                    return (
                                        <div key={origIdx} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                                            {!isMe && <img src="/images/imgmes1.png" className="w-12 h-12 rounded-full object-cover mr-2" alt="assistant" />}
                                            <div className="relative w-auto max-w-[380px]">

                                                <div onContextMenu={(e) => handleContextMenu(e, origIdx)} onClick={() => toggleMenu(origIdx)} className={`px-4 py-2 rounded-2xl text-white cursor-pointer`} style={{ background: isMe ? "rgba(23,23,23,1)" : "rgba(98,98,98,1)" }}>
                                                    {/* if this message is a reply to another message, show a small inline reply preview */}
                                                    {msg.reply && (
                                                        <div className="mb-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs max-w-[270px] overflow-hidden text-ellipsis">
                                                            <div className={`font-semibold ${msg.reply.role === 'user' ? 'text-green-300' : 'text-blue-300'}`}>{msg.reply.role === 'user' ? 'vous' : activeChat.name}</div>
                                                            <div className="text-gray-300 truncate text-sm mt-1">{msg.reply.content}</div>
                                                        </div>
                                                    )}

                                                    {msg.removed ? (
                                                        <span className="text-gray-400 italic">Vous avez retiré un message</span>
                                                    ) : (
                                                        msg.type === "image"
                                                            ? <div className="w-40 h-40 relative"><Image src="/images/mock.png" alt="Mock Image" fill className="object-cover rounded-xl" /></div>
                                                            : <div className="whitespace-pre-wrap">{msg.content}</div>
                                                    )}
                                                </div>

                                                {msg.reaction && (
                                                    <div className="absolute bottom-[-10px] right-0">
                                                        <span className="text-2xl">{msg.reaction}</span>
                                                    </div>
                                                )}


                                                {/* Le menu contextuel ne s'affiche que si openMenuIndex === origIdx (clic uniquement) */}
                                                {isMenuOpen && (
                                                    <div
                                                        ref={menuRef}
                                                        className="absolute z-50 rounded-xl shadow-xl p-3 flex flex-col items-center"
                                                        style={{
                                                            top: "-110px",
                                                            left: isMe ? "auto" : "-10px",
                                                            right: isMe ? "-10px" : "auto",
                                                            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                                                            backdropFilter: "blur(10px)",
                                                            border: "1px solid rgba(255,255,255,0.1)",
                                                        }}
                                                    >
                                                        {/* Réactions (toujours alignées horizontalement sous le message) */}
                                                        <div className="flex gap-2 mt-1 flex-nowrap overflow-x-auto">
                                                            {reactions.map(r => (
                                                                <div
                                                                    key={r}
                                                                    className={`text-2xl cursor-pointer hover:scale-125 transition ${msg.reaction === r ? "bg-white/30 rounded-full p-1" : ""
                                                                        }`}
                                                                    onClick={() => handleReaction(origIdx, r)}
                                                                >
                                                                    {r}
                                                                </div>
                                                            ))}
                                                        </div>


                                                        {/* Message original sur lequel on clique (fixe à droite, largeur adaptative) */}
                                                        <div
                                                            className="inline-block max-w-[70%] p-2 rounded-full mt-2 bg-[rgba(23,23,23,1)] text-white text-sm ml-auto"
                                                        >
                                                            {msg.content}
                                                        </div>



                                                        {/* Actions (fixe et centré) */}
                                                        <div className="w-[160px] mx-auto flex flex-col ml-29 gap-1 p-2 rounded mt-2" style={{ background: "rgba(56,56,56,1)" }}>
                                                            <div className="text-left text-white text-[10px]">{msg.time}</div>
                                                            <div className="flex flex-col gap-1 text-sm mt-1">
                                                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => handleReply(origIdx)}>
                                                                    <Reply size={16} /><span>Répondre</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => handleShare(origIdx)}>
                                                                    <Share2 size={16} /><span>Transférer</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => handlePin(origIdx)}>
                                                                    <Pin size={16} /><span>Épingler</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => handleDelete(origIdx)}>
                                                                    <Trash2 size={16} /><span>Supprimer pour vous</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer text-[#e95a5a] hover:bg-white/10" onClick={() => handleRemoveForEveryone(origIdx)}>
                                                                    <Undo2 size={16} className="text-red-400" /><span>Retirer</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                )}
                                            </div>

                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <ReplyPreview />

                            <form onSubmit={sendMessage} className="relative flex items-center mt-2">
                                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={isLoading ? "Envoi du message..." : "Tapez votre message..."} disabled={isLoading} className="flex-1 bg-[rgba(98,98,98,0.6)] text-white p-3 pr-14 rounded-3xl outline-none backdrop-blur-[40px]" />
                                <button type="submit" disabled={isLoading} className="absolute right-3 w-9 h-9 flex items-center justify-center hover:bg-red-500 rounded-full">
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Image src="/icons/send.png" alt="Envoyer" width={24} height={24} />}
                                </button>
                            </form>
                            {/* Undo toast */}
                            {undoStack.length > 0 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#101010] border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
                                    <div className="text-sm text-gray-300">Dernière action supprimée</div>
                                    <button onClick={handleUndo} className="bg-white/10 text-sm px-3 py-1 rounded-full hover:bg-white/20">Annuler</button>
                                </div>
                            )}
                        </div>

                        {/* Conteneur de l'image (collé à la card discussion) - show only when sidebar is mini (active) */}
                        {isSidebarCollapsed && (
                            <div className="flex-shrink-0 ml-0">
                                <LargeImagePlaceholder alignTop />
                            </div>
                        )}
                    </div>


                    {/* Share modal - using TransferModal component */}
                    <TransferModal
                        open={shareModal.open}
                        index={shareModal.index}
                        messages={messages}
                        chatListItems={chatListItems}
                        onClose={() => setShareModal({ open: false, index: null })}
                        onSend={(recipient, msg) => {
                            setMessages(prev => [...prev, { role: 'user', content: `Transféré à ${recipient.name}: ${msg.type === 'image' ? '[image]' : msg.content}`, type: 'text', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
                            setShareModal({ open: false, index: null });
                        }}
                    />
                </div>
            </main>

        </div>
    );

}