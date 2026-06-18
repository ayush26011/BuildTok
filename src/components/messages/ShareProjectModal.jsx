import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Send, Check } from 'lucide-react';
import Avatar from '../ui/Avatar';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export default function ShareProjectModal({ isOpen, onClose, projectId }) {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingState, setSendingState] = useState({}); // conversationId/userId -> 'sending' | 'sent'

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await API.get('/messages/conversations');
        if (res.success && res.data) {
          setConversations(res.data);
        }
      } catch (err) {
        console.error('Failed to load conversations for sharing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(searchQuery);
        if (res.success && res.data) {
          // Exclude self from search results
          setSearchResults(res.data.filter(u => u._id !== currentUser?._id && u.id !== currentUser?._id));
        }
      } catch (err) {
        console.error('Search failed in share modal:', err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUser]);

  const handleShare = async (id, isUser = false) => {
    const key = isUser ? `user_${id}` : `conv_${id}`;
    setSendingState(prev => ({ ...prev, [key]: 'sending' }));

    try {
      const payload = { projectId };
      if (isUser) {
        payload.recipientId = id;
      } else {
        payload.conversationId = id;
      }

      const res = await API.post('/messages/share-project', payload);
      if (res.success) {
        setSendingState(prev => ({ ...prev, [key]: 'sent' }));
      } else {
        setSendingState(prev => ({ ...prev, [key]: null }));
      }
    } catch (err) {
      console.error('Failed to share project:', err);
      setSendingState(prev => ({ ...prev, [key]: null }));
    }
  };

  if (!isOpen) return null;

  const getRecipient = (conv) => {
    return conv.participants.find(p => p._id !== currentUser?._id && p.id !== currentUser?._id) || {};
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="glass rounded-3xl p-6 max-w-md w-full relative z-10 max-h-[80vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-display font-extrabold text-xl text-[#561C24] dark:text-cream">Share Project</h2>
          <button onClick={onClose} className="text-[#561C24]/60 hover:text-[#561C24] dark:text-cream/60 dark:hover:text-cream">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search builders to share..."
            className="input-premium text-xs pl-8 pr-4 py-2"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#561C24]/40" />
        </div>

        {/* List scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {searchQuery.trim().length >= 2 ? (
            searchResults.length === 0 ? (
              <p className="text-center text-xs text-[#561C24]/60 py-8">No users found</p>
            ) : (
              searchResults.map(u => {
                const state = sendingState[`user_${u._id || u.id}`];
                return (
                  <div key={u._id || u.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Avatar user={u} size="sm" ring={false} />
                      <div>
                        <p className="font-bold text-xs text-[#561C24] dark:text-cream">{u.name}</p>
                        <p className="text-[10px] text-[#561C24]/50 dark:text-cream/50">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShare(u._id || u.id, true)}
                      disabled={state === 'sending' || state === 'sent'}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                        state === 'sent'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-maroon-gradient text-cream-light hover:opacity-90'
                      }`}
                    >
                      {state === 'sending' ? 'Sending...' : state === 'sent' ? <><Check size={10} /> Sent</> : <><Send size={10} /> Send</>}
                    </button>
                  </div>
                );
              })
            )
          ) : conversations.length === 0 ? (
            loading ? (
              <p className="text-center text-xs text-[#561C24]/60 py-8">Loading chats...</p>
            ) : (
              <p className="text-center text-xs text-[#561C24]/60 py-8">No active conversations yet.</p>
            )
          ) : (
            conversations.map(conv => {
              const r = getRecipient(conv);
              const state = sendingState[`conv_${conv._id}`];
              return (
                <div key={conv._id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Avatar user={r} size="sm" ring={false} />
                    <div>
                      <p className="font-bold text-xs text-[#561C24] dark:text-cream">{r.name}</p>
                      <p className="text-[10px] text-[#561C24]/50 dark:text-cream/50">@{r.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShare(conv._id, false)}
                    disabled={state === 'sending' || state === 'sent'}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                      state === 'sent'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-maroon-gradient text-cream-light hover:opacity-90'
                    }`}
                  >
                    {state === 'sending' ? 'Sending...' : state === 'sent' ? <><Check size={10} /> Sent</> : <><Send size={10} /> Send</>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
