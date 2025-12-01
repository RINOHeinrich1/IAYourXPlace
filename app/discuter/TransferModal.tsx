

import React, { useState } from 'react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  time: string;
}

interface ChatListItem {
  id: string | number;
  name: string;
  lastMessage: string;
  profileSrc: string;
}

interface TransferModalProps {
  open: boolean;
  index: number | null;
  messages: Message[];
  chatListItems: ChatListItem[];
  onClose: () => void;
  onSend: (recipient: ChatListItem, message: Message) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ open, index, messages, chatListItems, onClose, onSend }) => {
  const [selectedRecipient, setSelectedRecipient] = useState<ChatListItem | null>(null);

  if (!open || index === null || !messages[index]) return null;
  const message = messages[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#181818] rounded-2xl p-8 w-[400px] shadow-2xl relative flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-xl">✕</button>
        <h2 className="text-2xl font-bold text-white mb-6">Transférer le message</h2>
        <div className="mb-4">
          <div className="text-gray-300 text-sm mb-2">Aperçu du message :</div>
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-white">
            {message.type === 'image' ? (
              <div className="w-32 h-32 relative mx-auto">
                <Image src="/images/mock.png" alt="Image" fill className="object-cover rounded-xl" />
              </div>
            ) : (
              <span>{message.content}</span>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-gray-300 text-sm mb-2">Choisir le destinataire :</div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {chatListItems.map(chat => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${selectedRecipient?.id === chat.id ? 'bg-red-500/20 border border-red-500' : 'hover:bg-white/10'}`}
                onClick={() => setSelectedRecipient(chat)}
              >
                <Image src={chat.profileSrc} alt={chat.name} width={36} height={36} className="rounded-full object-cover" />
                <div>
                  <div className="text-white font-semibold text-sm">{chat.name}</div>
                  <div className="text-gray-400 text-xs">{chat.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          className={`mt-2 w-full py-2 rounded-xl font-semibold text-white transition ${selectedRecipient ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 cursor-not-allowed'}`}
          disabled={!selectedRecipient}
          onClick={() => selectedRecipient && onSend(selectedRecipient, message)}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default TransferModal;