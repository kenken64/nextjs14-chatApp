import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import clientPromise from '../lib/mongodb';
import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

interface SocketServer extends HTTPServer {
    io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextResponseWithSocket extends NextResponse {
    socket: SocketWithIO;
}

let io: SocketIOServer;

export const initSocketServer = (res: NextResponseWithSocket) => {
    console.log(res)
    if ((res as any).socket.server.io) {
        console.log('Socket is already running');
        io = (res as any).socket.server.io;
    } else {
        console.log('Socket is initializing');
        io = new SocketIOServer((res as any).socket.server as any);
        (res as any).socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('A user connected');

            socket.on('chat message', async (msg) => {
                io.emit('chat message', msg);

                try {
                    const client = await clientPromise;
                    const db = client.db('chatapp');
                    await db.collection('messages').insertOne(msg);
                } catch (error) {
                    console.error('Error saving message to database:', error);
                }
            });

            socket.on('upload file', async (fileData, callback) => {
                const { buffer, mimetype, originalname } = fileData;
                const fileName = `${Date.now()}-${originalname}`;
                const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

                try {
                    await fs.promises.writeFile(filePath, buffer);
                    const fileUrl = `/uploads/${fileName}`;
                    io.emit('file uploaded', { fileUrl, mimetype });
                    callback({ success: true, fileUrl });
                } catch (error) {
                    console.error('Error saving file:', error);
                    callback({ success: false, error: 'Failed to save file' });
                }
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
    }

    return io;
};

export default initSocketServer;