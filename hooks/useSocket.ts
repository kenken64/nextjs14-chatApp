import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
      const newSocket = io();

      newSocket.on('connect', () => {
        console.log('Connected to socket');
      });

      setSocket(newSocket);
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return socket;
};