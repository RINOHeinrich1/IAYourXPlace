// ============================================
// AI Chat System TypeScript Types
// Compatible with existing database schema
// Aligned with admin-YourXplace AICharacter interface
// ============================================

// AI Model (from existing ai_models table) - represents an AI character
// Core fields match admin-YourXplace/src/types/chat.d.ts AICharacter interface
export interface AIModel {
  id: string;
  name: string;
  // Core required fields (matching AICharacter from admin-YourXplace)
  personality: string;
  avatar: string; // Alias for avatar_url, matches admin-YourXplace naming
  avatar_url?: string; // Kept for backward compatibility with database
  description: string;
  greetings: string[];
  systemPrompt: string;
  // Database metadata fields
  version?: string;
  status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Extended profile fields (optional, for enhanced AI character customization)
  age?: number;
  ethnicities?: string[];
  hair_type?: string;
  hair_color?: string;
  eye_color?: string;
  body_type?: string;
  chest_size?: string;
  relationship?: string[];
  profession?: string[];
  sexual_preferences?: string[];
  voice?: string;
}

// Alias for backward compatibility
export type AIProfile = AIModel;

// Conversation between a user and an AI
// Using existing conversations table structure
export interface Conversation {
  id: string;
  sender_id?: string; // Profile ID (from profiles table)
  receiver_id?: string; // Profile ID (for user-to-user chats)
  model_id?: string; // AI Model ID (from ai_models table)
  ai_profile_id?: string; // Backward compatibility alias for model_id
  title?: string;
  last_message_at?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
  created_at: string;
  updated_at?: string;
  // Joined data
  ai_model?: AIModel;
  ai_profile?: AIModel; // Backward compatibility alias for ai_model
  last_message?: Message;
  unread_count?: number;
}

// Individual chat message
// Using existing messages table structure
export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string; // Profile ID (null for AI messages)
  content?: string;
  attachment_url?: string;
  title?: string;
  description?: string;
  price?: number;
  viewed?: boolean;
  content_type?: string; // 'text' | 'image' | etc.
  // Extended columns (added by migration)
  role?: 'user' | 'assistant';
  reply_to_id?: string;
  reaction?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at?: string;
  // Joined data
  reply_to?: Message;
}

// API Request/Response Types

export interface SendMessageRequest {
  conversation_id?: string; // If not provided, create new conversation
  model_id: string; // AI Model ID
  content: string;
  content_type?: 'text' | 'image';
  reply_to_id?: string;
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
  conversation_id: string;
}

export interface GetConversationsResponse {
  conversations: (Conversation & { ai_model: AIModel })[];
}

export interface GetMessagesRequest {
  conversation_id: string;
  limit?: number;
  before?: string; // For pagination - messages before this timestamp
}

export interface GetMessagesResponse {
  messages: Message[];
  has_more: boolean;
}

export interface DeleteMessageRequest {
  message_id: string;
}

export interface DeleteConversationRequest {
  conversation_id: string;
}

// Conversation List Item for sidebar display
export interface ConversationListItem {
  id: string;
  ai_model?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  // Backward compatibility alias for ai_model
  ai_profile?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: {
    content?: string;
    role?: 'user' | 'assistant';
    created_at: string;
  };
  last_message_at?: string;
  is_pinned?: boolean;
}

// Create AI Model Request
// Core fields are required (matching AICharacter from admin-YourXplace)
export interface CreateAIModelRequest {
  // Required core fields
  name: string;
  personality: string;
  avatar: string; // Primary field for avatar (matches admin-YourXplace naming)
  avatar_url?: string; // Backward compatibility with database column
  description: string;
  greetings: string[];
  systemPrompt: string;
  // Optional extended profile fields
  age?: number;
  ethnicities?: string[];
  hair_type?: string;
  hair_color?: string;
  eye_color?: string;
  body_type?: string;
  chest_size?: string;
  relationship?: string[];
  profession?: string[];
  sexual_preferences?: string[];
  voice?: string;
}

// Alias for backward compatibility
export type CreateAIProfileRequest = CreateAIModelRequest;

