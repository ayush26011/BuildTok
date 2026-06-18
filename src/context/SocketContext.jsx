import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API from '../services/api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await API.get('/messages/conversations');
      if (res.success && res.data) {
        const count = res.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadCount(count);
        unreadCountRef.current = count;
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setUnreadCount(0);
      setOnlineUsers([]);
      return;
    }

    // Resolve socket connection address from api base URL path
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175/api';
    const SOCKET_URL = BASE_URL.replace('/api', '');

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_user', user._id || user.id);
      fetchUnreadCount();
    });

    // Listen for online status updates from others
    newSocket.on('user_online', ({ userId, online }) => {
      setOnlineUsers((prev) => {
        if (online) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    // Listen for global notification events
    newSocket.on('new_message_notification', () => {
      fetchUnreadCount();
    });

    newSocket.on('receive_message', () => {
      fetchUnreadCount();
    });

    newSocket.on('message_seen', () => {
      fetchUnreadCount();
    });

    setSocket(newSocket);

    // Initial fetch of unread count
    fetchUnreadCount();

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
};
