import dynamic from 'next/dynamic';
import ConversationList from '@/components/ConversationList';

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Conversation</h1>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 mr-4 border rounded-md">
          <ConversationList />
        </div>
        <div className="flex-grow">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}