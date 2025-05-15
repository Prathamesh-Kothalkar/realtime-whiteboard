import { Server } from 'socket.io';

export const initializeSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        socket.on('draw', (pathData) => {
            console.log(`✏️ Drawing from ${socket.id}`);
            socket.broadcast.emit('draw', pathData);
        });

        socket.on('clear', () => {
            console.log(`🧹 Clear event from ${socket.id}`);
            socket.broadcast.emit('clear');
        });

        // When a new client requests canvas state
        socket.on('request-canvas', () => {
            socket.broadcast.emit('send-canvas', socket.id);
        });

        // Forward canvas data to specific user
        socket.on('canvas-data', ({ to, data }) => {
            io.to(to).emit('canvas-data', { data });
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    return io;
};
