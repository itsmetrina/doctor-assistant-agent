import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io("http://localhost:5000", { autoConnect: false });
    }
    return socket;
};

export const initSocket = () => {
    const s = connectSocket();
    if (!s.connected) s.connect(); // connect only once
    return s;
};

export const getSocket = () => {
    if (!socket) throw new Error("Socket not connected");
    return socket;
};
