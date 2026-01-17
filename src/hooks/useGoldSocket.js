import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useGoldSocket = () => {
    const [prices, setPrices] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('✅ Socket Connected');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket Disconnected');
            setConnected(false);
        });

        socket.on('price_update', (data) => {
            setPrices(data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return { prices, connected };
};