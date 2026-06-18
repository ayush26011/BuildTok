import { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import ProBadge from '../ui/ProBadge';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { userService } from '../../services/userService';
import API from '../../services/api';

export default function ConversationList({ 
  activeConversation, 
  onSelectConversation, 
  conversations = [], 
  loading = false, 
  fetchConversations 
}) {
  const { user: currentUser } = useAuth();
  const { onlineUsers, fetchUnreadCount } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Debounce search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(searchQuery);
        if (res.success && res.data) {
          // Exclude self from search
          setSearchResults(res.data.filter(u => u._id !== currentUser?._id && u.id !== currentUser?._id));
        }
      } catch (err) {
        console.error('User search failed in DM inbox:', err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUser]);

  const handleStartChatWithUser = async (userId) => {
    try {
      const res = await API.get(`/messages/conversations/with/${userId}`);
      if (res.success && res.data) {
        setSearchQuery('');
        setSearchResults([]);
        onSelectConversation(res.data);
        fetchConversations();
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const getRecipient = (conv) => {
    return conv.participants.find(p => p._id !== currentUser?._id && p.id !== currentUser?._id) || {};
  };

  const formatLastMessage = (msg) => {
    if (!msg) return 'No messages yet';
    const senderName = msg.sender?._id === currentUser?._id ? 'You' : msg.sender?.name || 'Partner';
    const text = msg.sharedProject ? 'shared a project' : msg.text;
    return `${senderName}: ${text}`;
  };

  return (
    <div className="flex flex-col h-full border-r border-white/10">
      {/* Search Input */}
      <div className="p-4 shrink-0">
        <div className="relative">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search builders..."
            className="input-premium pl-9 pr-4 py-2.5 text-xs"
          />
          <Search size={14} className="absolute left-3 top-3 text-[#561C24]/50" />
        </div>
      </div>

      {/* List content */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-2 pb-4 space-y-1">
        {searchQuery.trim().length >= 2 ? (
          /* Search results listing */
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-[#561C24]/50 px-3 mb-2">Search Results</p>
            {searchResults.length === 0 ? (
              <p className="text-center text-xs text-white/40 py-6">No builders found</p>
            ) : (
              searchResults.map(u => (
                <div
                  key={u._id || u.id}
                  onClick={() => handleStartChatWithUser(u._id || u.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-[#561C24]/05 transition-colors border border-transparent hover:border-[#561C24]/05"
                >
                  <Avatar user={u} size="sm" ring={false} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-[#561C24] dark:text-cream truncate">{u.name}</span>
                      {u.isPro && <ProBadge size="xs" />}
                    </div>
                    <p className="text-[10px] text-[#561C24]/50 dark:text-cream/50 truncate">@{u.username}</p>
                  </div>
                  <Plus size={14} className="text-[#561C24]/60" />
                </div>
              ))
            )}
          </div>
        ) : loading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#561C24]/20 border-t-[#561C24] animate-spin" />
            <p className="text-xs text-[#561C24]/40">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          /* Conversations placeholder */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <MessageCircle className="w-8 h-8 text-[#561C24]/30" />
            <p className="text-xs text-white/40">No conversations yet.</p>
          </div>
        ) : (
          /* Conversations list */
          conversations.map(conv => {
            const recipient = getRecipient(conv);
            const isOnline = onlineUsers.includes(recipient._id) || recipient.isOnline;
            const isActive = activeConversation?._id === conv._id;
            const hasUnread = conv.unreadCount > 0;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-[#561C24]/08 border-[#561C24]/10 shadow-glass'
                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                }`}
              >
                {/* Avatar with Online indicator */}
                <div className="relative">
                  <Avatar user={recipient} size="md" ring={isActive} />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#1a1a2e]" />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-bold text-xs text-[#561C24] dark:text-cream truncate">{recipient.name}</span>
                      {recipient.isPro && <ProBadge size="xs" />}
                    </div>
                    {conv.lastMessage && (
                      <span className="text-[9px] text-[#561C24]/40 dark:text-cream/40 shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-[11px] truncate flex-grow ${
                      hasUnread
                        ? 'font-extrabold text-[#561C24] dark:text-cream'
                        : 'text-[#561C24]/50 dark:text-cream/50'
                    }`}>
                      {formatLastMessage(conv.lastMessage)}
                    </p>
                    {hasUnread && (
                      <span className="w-5 h-5 rounded-full bg-[#561C24] text-cream-light font-bold text-[9px] flex items-center justify-center shadow-maroon shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
