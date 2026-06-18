import { useState, useEffect, useRef } from 'react';
import { Send, Eye, Smile, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';
import ProBadge from '../ui/ProBadge';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';

export default function ChatWindow({ conversation, onNewMessageSent, onBack }) {
  const { user: currentUser } = useAuth();
  const { socket, onlineUsers, fetchUnreadCount } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isTypingRef = useRef(false);
  const messagesRef = useRef([]);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const getRecipient = () => {
    if (!conversation || !conversation.participants) return {};
    return conversation.participants.find(p => p._id !== currentUser?._id && p.id !== currentUser?._id) || {};
  };

  const recipient = getRecipient();
  const isRecipientOnline = onlineUsers.includes(recipient._id) || recipient.isOnline;

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch messages on conversation change
  useEffect(() => {
    if (!conversation) return;
    let active = true;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/messages/${conversation._id}`);
        if (res.success && active) {
          setMessages(res.data || []);
          scrollToBottom('auto');
          // Update global context badge count
          fetchUnreadCount();
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMessages();

    // Join room and emit initial seen only once per conversation load
    if (socket) {
      socket.emit('join_conversation', conversation._id);
    }

    // Mark existing messages as seen once the conversation is opened
    API.post('/messages/seen', { conversationId: conversation._id }).catch(() => {});
    if (socket) {
      socket.emit('message_seen', {
        conversationId: conversation._id,
        userId: currentUser?._id,
        messageIds: [],
      });
    }

    return () => {
      active = false;
      if (socket) {
        socket.emit('leave_conversation', conversation._id);
        socket.emit('stop_typing', {
          conversationId: conversation._id,
          userId: currentUser?._id,
        });
      }
      setIsOtherTyping(false);
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversation, socket, currentUser]);

  // 2. Setup socket listeners
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleReceiveMessage = (message) => {
      if (message.conversation === conversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom('smooth');

        // Mark as seen immediately if we are in this window
        if (message.sender._id !== currentUser?._id) {
          socket.emit('message_seen', {
            conversationId: conversation._id,
            userId: currentUser?._id,
            messageIds: [message._id],
          });
          API.post('/messages/seen', { conversationId: conversation._id }).catch(() => {});
        }
      }
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation._id && userId !== currentUser?._id) {
        setIsOtherTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation._id && userId !== currentUser?._id) {
        setIsOtherTyping(false);
      }
    };

    const handleMessageSeen = ({ conversationId, userId, messageIds }) => {
      if (conversationId === conversation._id && userId !== currentUser?._id) {
        // Mark all messages as read by other user
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.sender._id === currentUser?._id) {
              const read = msg.readBy || [];
              if (!read.includes(userId)) {
                return { ...msg, readBy: [...read, userId] };
              }
            }
            return msg;
          })
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_seen', handleMessageSeen);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_seen', handleMessageSeen);
    };
  }, [socket, conversation, currentUser]);

  // Scroll to bottom when other user typing status changes
  useEffect(() => {
    if (isOtherTyping) {
      scrollToBottom('smooth');
    }
  }, [isOtherTyping]);

  // 3. Handle keypress & typing indicators with debounce
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!socket || !conversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', {
        conversationId: conversation._id,
        userId: currentUser?._id,
        username: currentUser?.username,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        conversationId: conversation._id,
        userId: currentUser?._id,
      });
      isTypingRef.current = false;
    }, 2000);
  };

  // 4. Send Message Handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text.trim();
    setText('');

    // Emit stop typing instantly on send
    if (socket) {
      socket.emit('stop_typing', {
        conversationId: conversation._id,
        userId: currentUser?._id,
      });
    }
    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      const res = await API.post('/messages/send', {
        conversationId: conversation._id,
        text: messageText,
      });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom('smooth');
        onNewMessageSent();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const isLastMessageSeen = () => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender._id !== currentUser?._id) return false;
    const readers = lastMsg.readBy || [];
    return readers.includes(recipient._id);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]/20 overflow-hidden">
      {/* Active Chat Header */}
      <div className="px-5 py-3 shrink-0 flex items-center justify-between border-b border-white/10 glass select-none">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="lg:hidden mr-1 text-[#561C24] dark:text-cream focus:outline-none">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="relative">
            <Avatar user={recipient} size="sm" ring={false} />
            {isRecipientOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-[#1a1a2e]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-[#561C24] dark:text-cream leading-tight">{recipient.name}</span>
              {recipient.isPro && <ProBadge size="xs" />}
            </div>
            <p className="text-[10px] text-[#561C24]/60 dark:text-beige-warm/60">
              {isOtherTyping ? (
                <span className="text-gradient font-bold animate-pulse">typing...</span>
              ) : isRecipientOnline ? (
                'Online'
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-white/40">Loading history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
            <Smile className="w-10 h-10 text-[#561C24]/30" />
            <p className="text-sm font-semibold text-[#561C24]/60 dark:text-cream/60">Say hello to {recipient.name}!</p>
            <p className="text-xs text-white/30 max-w-[200px]">Send a greeting message or share your projects to start collaborating.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelf = msg.sender._id === currentUser?._id;
            const isLast = i === messages.length - 1;
            const seen = isSelf && (msg.readBy?.includes(recipient._id) || isLastMessageSeen());
            return (
              <MessageBubble
                key={msg._id || i}
                message={msg}
                isSelf={isSelf}
                isSeen={seen}
                isLast={isLast}
                recipient={recipient}
              />
            );
          })
        )}
        {isOtherTyping && (
          <div className="flex gap-2.5 max-w-[75%] mr-auto items-end animate-slide-in">
            <Avatar user={recipient} size="xxs" ring={false} className="self-end shrink-0" />
            <div className="flex flex-col">
              <div className="glass text-[#561C24] dark:text-cream rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 bg-white/5 border border-white/10 min-h-[36px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#561C24] dark:bg-cream animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#561C24] dark:bg-cream animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#561C24] dark:bg-cream animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[8px] opacity-40 mt-1 pl-1">{recipient.name} is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 glass shrink-0 flex gap-3">
        <input
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-[#561C24] dark:text-cream placeholder-white/30 outline-none focus:border-[#561C24]/30"
        />
        <motion.button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-maroon-gradient flex items-center justify-center text-cream-light shrink-0 disabled:opacity-40"
          whileTap={{ scale: 0.9 }}
        >
          <Send size={14} />
        </motion.button>
      </form>
    </div>
  );
}
