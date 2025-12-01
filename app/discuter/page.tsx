'use client';

import { Sidebar, LargeImagePlaceholder } from './sidebar';
import TransferModal from './TransferModal';
import DropdownMenu from './DropdownMenu';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { Reply, Share2, Pin, Trash2, Undo2 } from 'lucide-react';

// Types for API data
interface AIModel {
  id: string;
  name: string;
  avatar_url?: string;
  avatar?: string;
  personality?: string;
  description?: string;
  systemPrompt?: string;
}

interface Conversation {
  id: string;
  model_id: string;
  title?: string;
  last_message_at?: string;
  ai_model?: AIModel | AIModel[];
  last_message?: {
    content: string;
    role: string;
    created_at: string;
  };
}

interface ChatListItem {
  id: string; // conversation id
  modelId: string; // AI model id
  name: string;
  lastMessage: string;
  profileSrc: string;
  lastAiResponseAt?: string; // ISO timestamp of last AI response for sorting
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  time: string;
  reaction?: string;
  reply?: { id?: string; index?: number; content: string; role: 'user' | 'assistant' } | undefined;
  reply_to_id?: string; // Database reference to parent message
  pinned?: boolean;
  removed?: boolean;
}

export default function DiscuterPage() {
  // Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const sidebarWidth = isSidebarCollapsed ? 80 : 299;

  // Dynamic chat list from API
  const [chatListItems, setChatListItems] = useState<ChatListItem[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [conversations, setConversations] = useState<Map<string, string>>(new Map()); // modelId -> conversationId
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const activeChat = chatListItems.find(chat => chat.id === selectedChatId);
  // Get the full AI model info for the selected chat
  const activeAiModel = aiModels.find(m => m.id === activeChat?.modelId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  // index of message currently hovered / showing reaction bar
  const [hoverReactionIndex, setHoverReactionIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // New states for share / undo stack
  const [shareModal, setShareModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [undoStack, setUndoStack] = useState<Array<any>>([]);

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyRestored, setReplyRestored] = useState(false); // Track if we've restored from localStorage

  // Persist replyTo state in localStorage
  const REPLY_STORAGE_KEY = 'discuter_reply_to';

  // Load replyTo from localStorage AFTER messages are loaded (run only once per conversation)
  useEffect(() => {
    // Reset the restored flag when conversation changes
    setReplyRestored(false);
    setReplyTo(null);
  }, [selectedChatId]);

  useEffect(() => {
    // Only attempt to restore once messages are loaded and we haven't restored yet
    if (replyRestored || isLoadingMessages || !selectedChatId || messages.length === 0) return;

    try {
      const stored = localStorage.getItem(REPLY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore if it's for the same conversation
        if (parsed.conversationId === selectedChatId) {
          // Try to find the message by ID first (more reliable)
          if (parsed.messageId) {
            const foundIndex = messages.findIndex(m => m.id === parsed.messageId);
            if (foundIndex !== -1) {
              setReplyTo(foundIndex);
              setReplyRestored(true);
              return;
            }
          }
          // Fallback to index if ID not found but index is valid
          if (typeof parsed.replyTo === 'number' && parsed.replyTo < messages.length) {
            setReplyTo(parsed.replyTo);
            setReplyRestored(true);
            return;
          }
        }
      }
      // Mark as restored even if nothing was found to avoid re-running
      setReplyRestored(true);
    } catch (e) {
      console.error('Error loading replyTo from localStorage:', e);
      setReplyRestored(true);
    }
  }, [selectedChatId, isLoadingMessages, messages.length, replyRestored]);

  // Save replyTo to localStorage when it changes (but not during initial restore)
  useEffect(() => {
    // Don't save during the initial restore phase
    if (!replyRestored) return;

    try {
      if (replyTo !== null && selectedChatId && messages[replyTo]) {
        localStorage.setItem(REPLY_STORAGE_KEY, JSON.stringify({
          conversationId: selectedChatId,
          replyTo: replyTo,
          messageId: messages[replyTo].id || null, // Store message ID for reliable lookup
          messageContent: messages[replyTo].content?.substring(0, 50) // Store preview for debugging
        }));
      } else if (replyTo === null) {
        localStorage.removeItem(REPLY_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving replyTo to localStorage:', e);
    }
  }, [replyTo, selectedChatId, messages, replyRestored]);

  const clearReply = () => {
    setReplyTo(null);
    try {
      localStorage.removeItem(REPLY_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing replyTo from localStorage:', e);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Fetch AI models and existing conversations on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingChats(true);
      try {
        // Fetch AI models and existing conversations in parallel
        const [modelsRes, convsRes] = await Promise.all([
          fetch('/api/ai-profiles'),
          fetch('/api/conversations')
        ]);

        const modelsData = await modelsRes.json();
        const convsData = await convsRes.json();

        const models: AIModel[] = modelsData.models || modelsData.profiles || [];
        const existingConvs: Conversation[] = convsData.conversations || [];

        setAiModels(models);

        // Build a map of modelId -> conversationId for existing conversations
        const convMap = new Map<string, string>();
        existingConvs.forEach(conv => {
          if (conv.model_id) {
            convMap.set(conv.model_id, conv.id);
          }
        });
        setConversations(convMap);

        // Build chat list items from AI models with conversation info
        const chatItems: ChatListItem[] = models.map(model => {
          const existingConv = existingConvs.find(c => c.model_id === model.id);
          const lastMsg = existingConv?.last_message;
          let lastMessage = 'Démarrer une conversation';
          // Track last AI response timestamp for sorting (use last_message if it's from AI, otherwise use last_message_at)
          let lastAiResponseAt: string | undefined = undefined;

          if (lastMsg) {
            const prefix = lastMsg.role === 'user' ? 'vous: ' : '';
            lastMessage = prefix + (lastMsg.content?.substring(0, 30) || '') + (lastMsg.content && lastMsg.content.length > 30 ? '...' : '');

            // If the last message is from AI, use its timestamp for sorting
            if (lastMsg.role === 'assistant') {
              lastAiResponseAt = lastMsg.created_at;
            } else if (existingConv?.last_message_at) {
              // Otherwise use the conversation's last_message_at as a fallback
              lastAiResponseAt = existingConv.last_message_at;
            }
          }

          return {
            id: existingConv?.id || model.id, // use conversation id if exists, otherwise model id
            modelId: model.id,
            name: model.name,
            lastMessage,
            profileSrc: model.avatar_url || model.avatar || '/images/default-avatar.png',
            lastAiResponseAt
          };
        });

        // Sort chat items: conversations with most recent AI responses first
        // Chats without any AI response (new chats) go to the end
        chatItems.sort((a, b) => {
          if (!a.lastAiResponseAt && !b.lastAiResponseAt) return 0;
          if (!a.lastAiResponseAt) return 1; // a goes after b
          if (!b.lastAiResponseAt) return -1; // a goes before b
          // Both have timestamps - sort by most recent first (descending)
          return new Date(b.lastAiResponseAt).getTime() - new Date(a.lastAiResponseAt).getTime();
        });

        setChatListItems(chatItems);

        // Select first chat if available
        if (chatItems.length > 0) {
          setSelectedChatId(chatItems[0].id);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchData();
  }, []);

  // Load messages when selected chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId || !activeChat) return;

      // Check if this is a conversation ID (UUID format) or just a model ID
      const conversationId = conversations.get(activeChat.modelId);

      if (!conversationId) {
        // No conversation exists yet for this AI model - start fresh
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
        const data = await res.json();

        if (data.messages && Array.isArray(data.messages)) {
          // First pass: create messages with reply_to_id stored
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            type: msg.content_type === 'image' ? 'image' : 'text',
            time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            reaction: msg.reaction,
            reply_to_id: msg.reply_to_id, // Store the database reference
            pinned: false,
            removed: msg.is_deleted,
          }));

          // Second pass: resolve reply references to build reply objects
          const messagesWithReplies = loadedMessages.map((msg, idx) => {
            if (msg.reply_to_id) {
              // Find the parent message by ID
              const parentIdx = loadedMessages.findIndex(m => m.id === msg.reply_to_id);
              if (parentIdx !== -1) {
                const parentMsg = loadedMessages[parentIdx];
                return {
                  ...msg,
                  reply: {
                    id: parentMsg.id,
                    index: parentIdx,
                    content: parentMsg.content,
                    role: parentMsg.role,
                  }
                };
              }
            }
            return msg;
          });

          setMessages(messagesWithReplies);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChatId, activeChat, conversations]);

  // Send message using /api/messages (with database persistence)
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeChat) return;

    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Get the parent message ID for replies
    const parentMessage = replyTo !== null ? messages[replyTo] : null;
    const replyToMessageId = parentMessage?.id || null;

    const replyPayload = parentMessage ? {
      id: parentMessage.id,
      index: replyTo !== null ? replyTo : undefined,
      content: parentMessage.content,
      role: parentMessage.role
    } : undefined;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      type: 'text',
      time: currentTime,
      reply: replyPayload,
      reply_to_id: replyToMessageId || undefined,
    };

    // Optimistically add user message to UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    clearReply();

    try {
      // Get or use existing conversation ID
      let conversationId = conversations.get(activeChat.modelId);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: activeChat.modelId,
          conversation_id: conversationId,
          content: input.trim(),
          content_type: 'text',
          reply_to_id: replyToMessageId, // Send parent message ID to database
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API');
      }

      const data = await response.json();

      // Update conversation mapping if new conversation was created
      if (data.conversation_id && !conversationId) {
        setConversations(prev => new Map(prev).set(activeChat.modelId, data.conversation_id));
        // Update chat list item ID to use conversation ID
        setChatListItems(prev => prev.map(item =>
          item.modelId === activeChat.modelId
            ? { ...item, id: data.conversation_id }
            : item
        ));
        setSelectedChatId(data.conversation_id);
      }

      // Update UI with the saved messages (including IDs from database)
      if (data.user_message && data.assistant_message) {
        setMessages(prev => {
          // Replace the optimistic user message with the one from DB (with ID)
          const withoutOptimistic = prev.slice(0, -1);
          return [
            ...withoutOptimistic,
            {
              id: data.user_message.id,
              role: 'user' as const,
              content: data.user_message.content,
              type: 'text' as const,
              time: new Date(data.user_message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              reply: replyPayload,
            },
            {
              id: data.assistant_message.id,
              role: 'assistant' as const,
              content: data.assistant_message.content,
              type: 'text' as const,
              time: new Date(data.assistant_message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            }
          ];
        });

        // Update last message in chat list and re-sort by most recent AI response
        setChatListItems(prev => {
          const updated = prev.map(item =>
            item.modelId === activeChat.modelId
              ? {
                  ...item,
                  lastMessage: data.assistant_message.content?.substring(0, 30) + '...',
                  lastAiResponseAt: data.assistant_message.created_at
                }
              : item
          );
          // Re-sort: most recent AI response first
          return updated.sort((a, b) => {
            if (!a.lastAiResponseAt && !b.lastAiResponseAt) return 0;
            if (!a.lastAiResponseAt) return 1;
            if (!b.lastAiResponseAt) return -1;
            return new Date(b.lastAiResponseAt).getTime() - new Date(a.lastAiResponseAt).getTime();
          });
        });
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `💥 ${error.message || 'Erreur réseau ou serveur.'}`, type: 'text', time: currentTime }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, replyTo, activeChat, conversations]);

  // These hooks MUST be called unconditionally (before any early returns)
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

  const handleScroll = useCallback(() => {
    const page = document.getElementById('discuter-page');
    if (page) {
      page.style.overflowY = 'auto';
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  // Show loading state while fetching chats
  if (isLoadingChats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-white/60" />
          <p className="text-white/60">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  // Show message if no AI models available
  if (chatListItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex" id="discuter-page">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 flex flex-col items-center justify-center p-6" style={{ marginLeft: `${sidebarWidth}px` }}>
          <h1 className="text-4xl font-bold mb-6">Discuter</h1>
          <p className="text-white/60 text-lg">Aucun modèle IA disponible.</p>
          <p className="text-white/40 text-sm mt-2">Créez un modèle IA pour commencer à discuter.</p>
        </main>
      </div>
    );
  }

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

  const handleReply = (idx: number, e?: React.MouseEvent) => {
    // Prevent event bubbling that might cause state issues
    e?.stopPropagation();
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
    if (replyTo === null || !messages[replyTo]) return null;
    const repliedMessage = messages[replyTo];
    const isMe = repliedMessage.role === 'user';
    const repliedToName = isMe ? "vous-même" : (activeChat?.name || 'IA');

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
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <h1 className="text-4xl font-bold mb-6">Discuter</h1>
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
                <div className="flex items-center gap-3">
                  <img src={activeChat?.profileSrc || '/images/default-avatar.png'} className="w-14 h-14 rounded-full object-cover" alt="profile" />
                  <div>
                    <h3 className="text-white font-semibold">{activeChat?.name || 'Chat'}</h3>
                    <p className="text-gray-400 text-xs">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <img src="/images/magic.png" className="h-7 rounded-full" alt="magic" />
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
              <div className="w-full h-px bg-white/20 mt-4"></div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* pinned messages (top) - keep original indices */}
                {pinnedIndices.map(origIdx => {
                  const msg = messages[origIdx];
                  const isMe = msg.role === "user";

                  return (
                    <div key={`pinned-${origIdx}`} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && <img src={activeChat?.profileSrc || '/images/default-avatar.png'} className="w-12 h-12 rounded-full object-cover mr-2" alt="assistant" />}
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
                      {isMe && <img src="/images/user.png" className="w-12 h-12 rounded-full object-cover ml-2" alt="me" />}
                    </div>
                  );
                })}

                {/* remaining messages */}
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-white/40" />
                    <span className="ml-2 text-white/40">Chargement des messages...</span>
                  </div>
                ) : null}
                {otherIndices.map(origIdx => {
                  const msg = messages[origIdx];
                  const isMe = msg.role === "user";
                  const isMenuOpen = openMenuIndex === origIdx;
                  return (
                    <div key={origIdx} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && <img src={activeChat?.profileSrc || '/images/default-avatar.png'} className="w-12 h-12 rounded-full object-cover mr-2" alt="assistant" />}
                      <div className="relative w-auto max-w-[380px]">

                        <div onContextMenu={(e) => handleContextMenu(e, origIdx)} onClick={() => toggleMenu(origIdx)} className={`px-4 py-2 rounded-2xl text-white cursor-pointer`} style={{ background: isMe ? "rgba(23,23,23,1)" : "rgba(98,98,98,1)" }}>
                          {/* if this message is a reply to another message, show a small inline reply preview */}
                          {msg.reply && (
                            <div className="mb-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs max-w-[270px] overflow-hidden text-ellipsis">
                              <div className={`font-semibold ${msg.reply.role === 'user' ? 'text-green-300' : 'text-blue-300'}`}>{msg.reply.role === 'user' ? 'vous' : activeChat?.name}</div>
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
                                <div className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-white/10" onClick={(e) => handleReply(origIdx, e)}>
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
                      {isMe && <img src="/images/user.png" className="w-12 h-12 rounded-full object-cover ml-2" alt="me" />}
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
                <LargeImagePlaceholder
                  alignTop
                  character={activeAiModel ? {
                    name: activeAiModel.name,
                    avatar_url: activeAiModel.avatar_url || activeAiModel.avatar,
                    description: activeAiModel.description,
                    personality: activeAiModel.personality,
                  } : undefined}
                />
              </div>
            )}
          </div>


          {/* Share modal - using TransferModal component */}
          <TransferModal
            open={shareModal.open}
            index={shareModal.index}
            messages={messages}
            chatListItems={chatListItems.filter(chat => chat.id !== selectedChatId)} // Exclude current chat from recipients
            onClose={() => setShareModal({ open: false, index: null })}
            onSend={async (recipient, msg) => {
              // Forward message to the selected recipient's conversation
              try {
                const forwardedContent = msg.type === 'image' ? '[Image transférée]' : `[Message transféré]: ${msg.content}`;

                // Get conversation ID for the recipient
                const recipientConversationId = conversations.get(recipient.modelId);

                // Send the forwarded message via API
                const response = await fetch('/api/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model_id: recipient.modelId,
                    conversation_id: recipientConversationId,
                    content: forwardedContent,
                    content_type: 'text',
                  }),
                });

                if (!response.ok) {
                  throw new Error('Erreur lors du transfert');
                }

                const data = await response.json();

                // Update conversation mapping if new conversation was created
                if (data.conversation_id && !recipientConversationId) {
                  setConversations(prev => new Map(prev).set(recipient.modelId, data.conversation_id));
                  // Update chat list item ID
                  setChatListItems(prev => prev.map(item =>
                    item.modelId === recipient.modelId
                      ? { ...item, id: data.conversation_id }
                      : item
                  ));
                }

                // Update last message in chat list for the recipient and re-sort
                if (data.assistant_message) {
                  setChatListItems(prev => {
                    const updated = prev.map(item =>
                      item.modelId === recipient.modelId
                        ? {
                            ...item,
                            lastMessage: data.assistant_message.content?.substring(0, 30) + '...',
                            lastAiResponseAt: data.assistant_message.created_at
                          }
                        : item
                    );
                    // Re-sort: most recent AI response first
                    return updated.sort((a, b) => {
                      if (!a.lastAiResponseAt && !b.lastAiResponseAt) return 0;
                      if (!a.lastAiResponseAt) return 1;
                      if (!b.lastAiResponseAt) return -1;
                      return new Date(b.lastAiResponseAt).getTime() - new Date(a.lastAiResponseAt).getTime();
                    });
                  });
                }

                // Show success notification (add a temporary message in current chat)
                const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                setMessages(prev => [...prev, {
                  role: 'assistant' as const,
                  content: `✓ Message transféré à ${recipient.name}`,
                  type: 'text' as const,
                  time: currentTime
                }]);

              } catch (error) {
                console.error('Error forwarding message:', error);
                const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                setMessages(prev => [...prev, {
                  role: 'assistant' as const,
                  content: `❌ Erreur lors du transfert du message`,
                  type: 'text' as const,
                  time: currentTime
                }]);
              }

              setShareModal({ open: false, index: null });
            }}
          />
        </div>
      </main>

    </div>
  );

}