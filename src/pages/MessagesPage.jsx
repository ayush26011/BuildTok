import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { pageVariants } from '../utils/animations';
import API from '../services/api';

export default function MessagesPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const { conversationId: paramConversationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);

  const recipientId = searchParams.get('recipientId');

  // ── Fetch all conversations ───────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      setConversationsLoading(true);
      const res = await API.get('/messages/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setConversationsLoading(false);
    }
    return [];
  }, [currentUser]);

  // ── Initial conversation load ─────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Socket-driven conversation list refresh ───────────────────────
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchConversations();
    socket.on('receive_message', refresh);
    socket.on('new_message_notification', refresh);
    socket.on('message_seen', refresh);
    return () => {
      socket.off('receive_message', refresh);
      socket.off('new_message_notification', refresh);
      socket.off('message_seen', refresh);
    };
  }, [socket, fetchConversations]);
  // ── Activate conversation when URL has :conversationId ───────────
  useEffect(() => {
    if (!paramConversationId || !currentUser) return;
    // If active conversation already matches the URL param, skip
    if (activeConversation?._id === paramConversationId) return;

    const loadById = async () => {
      // First try to find it in the already-loaded list
      const found = conversations.find(c => c._id === paramConversationId);
      if (found) {
        setActiveConversation(found);
        return;
      }
      // Otherwise try fetching fresh list and finding it there
      const freshList = await fetchConversations();
      const freshFound = freshList?.find(c => c._id === paramConversationId);
      if (freshFound) {
        setActiveConversation(freshFound);
      } else {
        console.warn('Conversation not found for id:', paramConversationId);
        navigate('/messages', { replace: true });
      }
    };

    loadById();
  }, [paramConversationId, currentUser]);

  // ── Handle ?recipientId= query param ─────────────────────────────
  useEffect(() => {
    if (!recipientId || !currentUser) return;

    // Validate: don't process 'undefined', 'null', or empty strings
    if (recipientId === 'undefined' || recipientId === 'null' || !recipientId.trim()) {
      console.warn('Invalid recipientId in URL, clearing params');
      setSearchParams({});
      return;
    }

    // Don't start a conversation with yourself
    if (recipientId === currentUser._id || recipientId === currentUser.id) {
      setSearchParams({});
      return;
    }

    const loadDirectConversation = async () => {
      try {
        const res = await API.get(`/messages/conversations/with/${recipientId}`);
        if (res.success && res.data) {
          const conv = res.data;
          setActiveConversation(conv);
          // Update conversations list if this is a new one
          setConversations(prev => {
            const exists = prev.some(c => c._id === conv._id);
            if (!exists) return [conv, ...prev];
            return prev;
          });
          // Sync URL to conversation ID
          navigate(`/messages/${conv._id}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to load direct conversation:', err);
      } finally {
        setSearchParams({});
      }
    };

    loadDirectConversation();
  }, [recipientId, currentUser]);

  // ── Conversation selection from list ─────────────────────────────
  const handleConversationSelect = (conv) => {
    setActiveConversation(conv);
    navigate(`/messages/${conv._id}`);
  };

  const handleBack = () => {
    setActiveConversation(null);
    navigate('/messages');
  };

  const handleNewMessageSent = () => {
    fetchConversations();
  };

  // ── Wait for auth to resolve before redirecting ───────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-ambient items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#561C24]/30 border-t-[#561C24] animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen bg-ambient overflow-hidden"
    >
      <Sidebar />

      <div className="flex-1 lg:ml-60 pt-16 pb-16 lg:pb-0 h-screen flex flex-col">
        <div className="flex-1 flex max-w-5xl w-full mx-auto p-4 gap-4 overflow-hidden h-full">
          {/* Inbox Glass Container */}
          <div className="glass rounded-3xl w-full flex overflow-hidden shadow-glass border border-white/10 h-[calc(100vh-6rem)] lg:h-[calc(100vh-5rem)]">

            {/* Left Column: Conversation List */}
            <div className={`w-full lg:w-[320px] shrink-0 h-full ${
              activeConversation ? 'hidden lg:block' : 'block'
            }`}>
              <ConversationList
                activeConversation={activeConversation}
                onSelectConversation={handleConversationSelect}
                conversations={conversations}
                loading={conversationsLoading}
                fetchConversations={fetchConversations}
              />
            </div>

            {/* Right Column: Chat Window */}
            <div className={`flex-1 h-full relative ${
              activeConversation ? 'block' : 'hidden lg:flex flex-col items-center justify-center'
            }`}>
              {activeConversation ? (
                <ErrorBoundary onReset={() => setActiveConversation(null)}>
                  <ChatWindow
                    key={activeConversation._id}
                    conversation={activeConversation}
                    onNewMessageSent={handleNewMessageSent}
                    onBack={handleBack}
                  />
                </ErrorBoundary>
              ) : (
                <div className="text-center p-6 space-y-3 select-none">
                  <div className="w-16 h-16 rounded-full bg-[#561C24]/10 flex items-center justify-center mx-auto text-[#561C24]">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="font-display font-extrabold text-base text-[#561C24] dark:text-cream">
                    Your Messages
                  </h3>
                  <p className="text-xs text-white/40 max-w-[240px] mx-auto">
                    Select a conversation from the left or search builders to start a new chat.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
