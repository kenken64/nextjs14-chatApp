"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import { Upload, Mic, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  reactions: { emoji: string; count: number }[];
  fileUrl?: string;
  fileType?: 'image' | 'audio';
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const socket = useSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (socket) {
      socket.on('chat message', (msg: Message) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      socket.on('initial messages', (initialMessages: Message[]) => {
        setMessages(initialMessages);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat message');
        socket.off('initial messages');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      const newMessage: Message = {
        id: Date.now(),
        sender: 'user',
        text: inputMessage,
        timestamp: new Date(),
        reactions: [],
      };
      socket.emit('chat message', newMessage);
      setInputMessage('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && socket) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        socket.emit('upload file', {
          buffer: Buffer.from(buffer),
          mimetype: file.type,
          originalname: file.name
        }, (response: { success: boolean; fileUrl?: string; error?: string }) => {
          if (response.success && response.fileUrl) {
            toast({
              title: "File uploaded",
              description: "Your file has been successfully uploaded.",
            });
          } else {
            toast({
              title: "Upload failed",
              description: response.error || "An error occurred while uploading the file.",
              variant: "destructive",
            });
          }
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          socket?.emit('upload file', {
            buffer: Buffer.from(buffer),
            mimetype: 'audio/wav',
            originalname: 'recorded_audio.wav'
          }, (response: { success: boolean; fileUrl?: string; error?: string }) => {
            if (response.success && response.fileUrl) {
              toast({
                title: "Audio uploaded",
                description: "Your audio recording has been successfully uploaded.",
              });
            } else {
              toast({
                title: "Upload failed",
                description: response.error || "An error occurred while uploading the audio.",
                variant: "destructive",
              });
            }
          });
        };
        reader.readAsArrayBuffer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "An error occurred while starting the recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                <p>{message.text}</p>
                {message.fileUrl && message.fileType === 'image' && (
                  <img src={message.fileUrl} alt="Uploaded content" className="max-w-xs rounded-md mt-2" />
                )}
                {message.fileUrl && message.fileType === 'audio' && (
                  <audio controls className="mt-2">
                    <source src={message.fileUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <span className="text-xs mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*,audio/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-grow"
          />
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}