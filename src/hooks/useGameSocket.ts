import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MatchState, SocketEvent, ChatMessage, GameRound } from '../types.js';

const SOCKET_URL = window.location.origin; // Same origin since we run Express fullstack on port 3000

export function useGameSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Use a ref to ensure event handlers have access to the latest connection states if needed
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setErrorMsg(null);
      console.log('📡 Socket.io connection established successfully');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle real-time Match State Sync
    newSocket.on(SocketEvent.STATE_SYNC, (state: MatchState) => {
      setMatchState(state);
      if (state.chatHistory) {
        setChatMessages(state.chatHistory);
      }
    });

    // Handle server-directed error messages
    newSocket.on(SocketEvent.ERROR, (data: { message: string }) => {
      setErrorMsg(data.message);
      // Auto-clear message after 5 seconds
      setTimeout(() => {
        setErrorMsg((current) => (current === data.message ? null : current));
      }, 5000);
    });

    // Handle direct chat messages
    newSocket.on(SocketEvent.RECEIVE_CHAT_MESSAGE, (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinGame = (name: string, position: 1 | 2 | 3 | 4, matchCode: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve({ success: false, error: 'Socket connection is currently unavailable.' });
        return;
      }
      socketRef.current.emit(
        SocketEvent.PLAYER_JOIN, 
        { name, position, matchCode }, 
        (res: { success: boolean; error?: string }) => {
          resolve(res);
        }
      );
    });
  };

  const adminAuth = (token: string, matchCode: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve({ success: false });
        return;
      }
      socketRef.current.emit(
        SocketEvent.ADMIN_AUTH,
        { token, matchCode },
        (res: { success: boolean }) => {
          resolve(res);
        }
      );
    });
  };

  const submitAnswer = (answer: string) => {
    if (socketRef.current) {
      socketRef.current.emit(SocketEvent.PLAYER_SUBMIT_ANSWER, { answer });
    }
  };

  const pressBuzzer = () => {
    if (socketRef.current) {
      socketRef.current.emit(SocketEvent.PLAYER_BUZZ);
    }
  };

  const pressBuzzerCNV = () => {
    if (socketRef.current) {
      socketRef.current.emit(SocketEvent.PLAYER_BUZZ_CNV);
    }
  };

  const sendChatMessage = (sender: 'ADMIN' | 'MC', text: string) => {
    if (socketRef.current) {
      socketRef.current.emit(SocketEvent.SEND_CHAT_MESSAGE, { sender, text });
    }
  };

  // Admin and state modification requests are also simple wrappers
  const adminCommand = (event: SocketEvent, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket,
    matchState,
    isConnected,
    errorMsg,
    setErrorMsg,
    chatMessages,
    joinGame,
    adminAuth,
    submitAnswer,
    pressBuzzer,
    pressBuzzerCNV,
    sendChatMessage,
    adminCommand,
  };
}
