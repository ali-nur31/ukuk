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

// Эндпоинт для отправки вопроса AI
router.post('/query', protect, chatController.query);

// Получение истории чата из Google Drive (требуется авторизация)
router.get('/drive-history', protect, chatController.getUserChatHistory);

module.exports = router; 