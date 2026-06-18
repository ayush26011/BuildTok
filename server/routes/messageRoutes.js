const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversationWithUser,
  getMessages,
  sendMessage,
  shareProject,
  markMessagesAsSeen,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All direct messaging routes are private (require authenticated user session)
router.get('/conversations', protect, getConversations);
router.get('/conversations/with/:userId', protect, getOrCreateConversationWithUser);
router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.post('/share-project', protect, shareProject);
router.post('/seen', protect, markMessagesAsSeen);

module.exports = router;
