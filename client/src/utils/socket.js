import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Replace with production URL if needed

const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
});

export const connectSocket = () => {
    if (socket && !socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;
