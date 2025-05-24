const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Получить историю чата с пользователем
router.get('/history/:userId', protect, chatController.getChatHistory);

// Отправить сообщение
router.post('/send', protect, chatController.sendMessage);

// Получить непрочитанные сообщения
router.get('/unread', protect, chatController.getUnreadMessages);

// Отметить сообщения как прочитанные
router.put('/read/:senderId', protect, chatController.markMessagesAsRead);

module.exports = router; 