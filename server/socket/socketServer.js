const { Server } = require('socket.io');
const Message = require('../models/Message');

let io = null;
const onlineUsers = new Map(); // userId (string) -> Set of socketId (string)

const initSocket = (server) => {
  // Build allowed origins list — mirrors Express CORS config
  const socketOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://build-tok.vercel.app',
    ...((process.env.CLIENT_URL || '')
      .split(',')
      .map(u => u.trim())
      .filter(Boolean)),
  ];

  io = new Server(server, {
    cors: {
      origin: socketOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  });

  io.on('connection', (socket) => {
    // 1. Join user global room and track online status
    socket.on('join_user', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      socket.join(`user_${userId}`);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Broadcast user is online
      io.emit('user_online', { userId, online: true });
    });

    // 2. Active room management for conversation
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation_${conversationId}`);
    });

    // 3. Typing indicator management
    socket.on('typing', ({ conversationId, userId, username }) => {
      socket.to(`conversation_${conversationId}`).emit('typing', { conversationId, userId, username });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(`conversation_${conversationId}`).emit('stop_typing', { conversationId, userId });
    });

    // 4. Message seen status propagation
    socket.on('message_seen', async ({ conversationId, userId, messageIds }) => {
      socket.to(`conversation_${conversationId}`).emit('message_seen', { conversationId, userId, messageIds });

      try {
        if (conversationId && userId) {
          await Message.updateMany(
            {
              conversation: conversationId,
              sender: { $ne: userId },
              readBy: { $ne: userId }
            },
            { $addToSet: { readBy: userId } }
          );
        }
      } catch (err) {
        console.error('Failed to persist message seen status via socket:', err);
      }
    });

    // 5. Clean up on disconnect
    socket.on('disconnect', () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const sockets = onlineUsers.get(socket.userId);
        sockets.delete(socket.id);
        
        if (sockets.size === 0) {
          onlineUsers.delete(socket.userId);
          // Broadcast user is offline
          io.emit('user_online', { userId: socket.userId, online: false });
        }
      }
    });
  });

  console.log('🔌 Socket.IO Server initialized successfully');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

const isUserOnline = (userId) => {
  if (!userId) return false;
  return onlineUsers.has(userId.toString());
};

module.exports = { initSocket, getIO, getOnlineUsers, isUserOnline };
