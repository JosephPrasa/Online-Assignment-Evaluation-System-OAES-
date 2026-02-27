const socketIO = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = socketIO(httpServer, {
            cors: {
                origin: '*', // Adjust this for production to the frontend URL
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            console.warn('Socket.io not initialized. Real-time events will not be emitted.');
            return {
                emit: () => { } // Mock emit to prevent crashes
            };
        }
        return io;
    }
};
