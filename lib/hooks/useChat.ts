'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message, Conversation, ConversationListItem } from '../types/chat';

interface UseChatOptions {
  conversationId?: string;
  modelId?: string; // AI model ID (renamed from aiProfileId)
  aiProfileId?: string; // Backward compatibility alias
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the model ID (support both modelId and aiProfileId for backward compatibility)
  const effectiveModelId = options.modelId || options.aiProfileId;

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/conversations');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Normalize conversations to have both ai_model and ai_profile for compatibility
      const normalizedConversations = (data.conversations || []).map((conv: Conversation & { ai_model?: object; ai_profile?: object }) => ({
        ...conv,
        ai_model: conv.ai_model || conv.ai_profile,
        ai_profile: conv.ai_profile || conv.ai_model, // backward compatibility
      }));

      setConversations(normalizedConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    replyToId?: string
  ) => {
    if (!content.trim() || isSending) return null;

    try {
      setIsSending(true);
      setError(null);

      const body: Record<string, string | undefined> = {
        content: content.trim(),
        reply_to_id: replyToId,
      };

      if (currentConversation?.id) {
        body.conversation_id = currentConversation.id;
      } else if (effectiveModelId) {
        // Use model_id for new API, but also send ai_profile_id for backward compatibility
        body.model_id = effectiveModelId;
        body.ai_profile_id = effectiveModelId;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Add both messages to state
      setMessages(prev => [...prev, data.user_message, data.assistant_message]);

      // Update conversation list
      await fetchConversations();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
      return null;
    } finally {
      setIsSending(false);
    }
  }, [currentConversation, effectiveModelId, isSending, fetchConversations]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setMessages(prev => prev.filter(m => m.id !== messageId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      return false;
    }
  }, []);

  // Update message reaction
  const updateReaction = useCallback(async (messageId: string, reaction: string | null) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reaction: reaction || undefined } : m
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      return false;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      return false;
    }
  }, [currentConversation]);

  // Select a conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setCurrentConversation(conv as unknown as Conversation);
      await fetchMessages(conversationId);
    }
  }, [conversations, fetchMessages]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (options.conversationId) {
      fetchMessages(options.conversationId);
    }
  }, [options.conversationId, fetchMessages]);

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    isSending,
    error,
    sendMessage,
    deleteMessage,
    updateReaction,
    deleteConversation,
    selectConversation,
    fetchConversations,
    fetchMessages,
    setCurrentConversation,
  };
}

