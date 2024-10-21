"use client"

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
}

const initialConversations: Conversation[] = [
  { id: 1, name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces", lastMessage: "Hey, how's it going?" },
  { id: 2, name: "Bob Smith", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=faces", lastMessage: "Did you see the latest update?" },
  { id: 3, name: "Carol Williams", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces", lastMessage: "Let's meet up tomorrow" },
  { id: 4, name: "David Brown", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces", lastMessage: "Thanks for your help!" },
];

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  return (
    <ScrollArea className="h-full">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
            selectedConversation === conversation.id ? 'bg-gray-200' : ''
          }`}
          onClick={() => setSelectedConversation(conversation.id)}
        >
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold">{conversation.name}</h3>
            <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}