const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Project = require('../models/Project');
const { getIO, isUserOnline } = require('../socket/socketServer');

// ─────────────────────────────────────────────────────────────────
// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name username avatar isPro verified')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name username avatar isPro verified',
      },
    })
    .sort({ updatedAt: -1 });

  // Add unread message counts and online status details
  const conversationData = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      });

      const convObj = conv.toObject();
      convObj.unreadCount = unreadCount;

      // Map online status
      convObj.participants = convObj.participants.map((p) => {
        p.isOnline = isUserOnline(p._id);
        return p;
      });

      return convObj;
    })
  );

  res.json({
    success: true,
    data: conversationData,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Check if conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  if (!conversation.participants.includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Unauthorized access to conversation');
  }

  // Mark other messages in this conversation as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    { $addToSet: { readBy: req.user._id } }
  );

  // Retrieve and populate messages
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name username avatar isPro verified')
    .populate({
      path: 'sharedProject',
      select: 'title description videoUrl category creator techStack',
      populate: {
        path: 'creator',
        select: 'name username avatar isPro verified',
      },
    })
    .sort({ createdAt: 1 });

  // Broadcast seen event if relevant
  try {
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit('message_seen', {
      conversationId,
      userId: req.user._id,
      messageIds: messages.filter(m => m.sender._id.toString() !== req.user._id.toString()).map(m => m._id),
    });
  } catch (err) {
    console.error('Failed to emit message_seen via socket:', err.message);
  }

  res.json({
    success: true,
    data: messages,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Get or create conversation with a specific user
// @route   GET /api/messages/conversations/with/:userId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getOrCreateConversationWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot start a conversation with yourself');
  }

  // Find if conversation exists between the two users
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, userId],
    });
  }

  const populated = await Conversation.findById(conversation._id)
    .populate('participants', 'name username avatar isPro verified')
    .populate('lastMessage');

  const convObj = populated.toObject();
  convObj.unreadCount = 0;
  convObj.participants = convObj.participants.map((p) => {
    p.isOnline = isUserOnline(p._id);
    return p;
  });

  res.json({
    success: true,
    data: convObj,
  });
});

// Helper to update last message
const updateLastMessage = async (conversationId, messageId) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: messageId,
    updatedAt: new Date(),
  });
};

// Helper to broadcast socket events
const broadcastNewMessage = (conversation, message, senderId) => {
  try {
    const io = getIO();
    const convId = conversation._id.toString();

    // Emit receive_message to active room
    io.to(`conversation_${convId}`).emit('receive_message', message);

    // Emit new_message_notification to user specific rooms
    conversation.participants.forEach((pId) => {
      const participantStr = pId.toString();
      if (participantStr !== senderId.toString()) {
        io.to(`user_${participantStr}`).emit('new_message_notification', {
          conversationId: convId,
          message,
        });
      }
    });
  } catch (err) {
    console.error('Socket broadcast failed for new message:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Send text message
// @route   POST /api/messages/send
// @access  Private
// ─────────────────────────────────────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, recipientId, text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  let finalConversationId = conversationId;
  let conversation;

  if (!finalConversationId) {
    if (!recipientId) {
      res.status(400);
      throw new Error('Please provide conversationId or recipientId');
    }
    // Find or create conversation with recipient
    conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      });
    }
    finalConversationId = conversation._id;
  } else {
    conversation = await Conversation.findById(finalConversationId);
  }

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Save Message
  const message = await Message.create({
    conversation: finalConversationId,
    sender: req.user._id,
    text: text.trim(),
    readBy: [req.user._id],
  });

  // Update Conversation
  await updateLastMessage(finalConversationId, message._id);

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name username avatar isPro verified');

  // Broadcast
  broadcastNewMessage(conversation, populatedMessage, req.user._id);

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Share project / reel inside chat
// @route   POST /api/messages/share-project
// @access  Private
// ─────────────────────────────────────────────────────────────────
const shareProject = asyncHandler(async (req, res) => {
  const { conversationId, recipientId, projectId, text } = req.body;

  if (!projectId) {
    res.status(400);
    throw new Error('Project ID is required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  let finalConversationId = conversationId;
  let conversation;

  if (!finalConversationId) {
    if (!recipientId) {
      res.status(400);
      throw new Error('Please provide conversationId or recipientId');
    }
    conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      });
    }
    finalConversationId = conversation._id;
  } else {
    conversation = await Conversation.findById(finalConversationId);
  }

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Save Message with sharedProject
  const message = await Message.create({
    conversation: finalConversationId,
    sender: req.user._id,
    text: text ? text.trim() : `Shared a project: ${project.title}`,
    sharedProject: projectId,
    readBy: [req.user._id],
  });

  // Update Conversation
  await updateLastMessage(finalConversationId, message._id);

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name username avatar isPro verified')
    .populate({
      path: 'sharedProject',
      select: 'title description videoUrl category creator techStack',
      populate: {
        path: 'creator',
        select: 'name username avatar isPro verified',
      },
    });

  // Broadcast
  broadcastNewMessage(conversation, populatedMessage, req.user._id);

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Mark all messages in a conversation as seen
// @route   POST /api/messages/seen
// @access  Private
// ─────────────────────────────────────────────────────────────────
const markMessagesAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.body;

  if (!conversationId) {
    res.status(400);
    throw new Error('Conversation ID is required');
  }

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  if (!conversation.participants.includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Unauthorized access to conversation');
  }

  // Update messages
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    { $addToSet: { readBy: req.user._id } }
  );

  // Broadcast seen event via socket
  try {
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit('message_seen', {
      conversationId,
      userId: req.user._id,
    });
  } catch (err) {
    console.error('Failed to emit message_seen via socket:', err.message);
  }

  res.json({
    success: true,
    message: 'Messages marked as seen',
  });
});

module.exports = {
  getConversations,
  getMessages,
  getOrCreateConversationWithUser,
  sendMessage,
  shareProject,
  markMessagesAsSeen,
};
