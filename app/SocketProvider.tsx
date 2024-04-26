'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from 'socket.io-client'
import { useAppSelector } from "./hooks";
import { selectSessionID } from "./global.state";

export type SocketContextType = {
    socket: any | null,
    isConnected: boolean
}

const defaultSocket = {
    socket: null,
    isConnected: false
};

export const SocketContext = createContext<SocketContextType>(defaultSocket);

export const useSocket = () => {
    return useContext(SocketContext);
}


export const SocketProvider= ({ children }: { children: React.ReactNode }) => {

    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {

        // let socketIo = require('socket.io-client');
        // const socketInstance = new (ClientIO as any)(`http://localhost:3002/chatroom/${sessionId}`); // TODO: make this dynamic
        // const socketInstance = new (ClientIO as any)(`ws://localhost:3002/hello`); // TODO: make this dynamic
        const socketInstance = new (ClientIO as any)(`http://localhost:5050`); // TODO: make this dynamic

        // let socketIo = require('socket.io-client');
        // let io = socketIo("http://localhost:3001/users");
        // let socketInstance = socketIo("http://localhost:3001/users");

        console.log("Creating websocket...")
        
        // Add an event listener to handle connections
        socketInstance.on('connect', () => {  // explain what happening here
            console.log("Websocket connected    !");
            setIsConnected(true);
            
        });
        
        socketInstance.on('disconnect', (reason: any) => {
            console.warn(`Websocket disconnected because of ${reason}`);
            setIsConnected(false);
        });

        setSocket(socketInstance);
        
        //Clean up function that gets called whenever this component unmounts
        return () => {
            console.log("Disconnecting websocket...");
            // Close the connection when this component unmounts
            socketInstance.disconnect();
        };

     }, []); // eslint-disable-line

    return (
        <SocketContext.Provider value={{socket: socket, isConnected: isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}