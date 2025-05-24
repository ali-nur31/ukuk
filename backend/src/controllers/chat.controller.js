const chatService = require('../services/chat.service');
const { Message, User } = require('../models');
const { Op } = require('sequelize');
const aiService = require('../services/ai.service');
const { saveChatHistory } = require('../services/googleDrive.service');

// Получить историю чата
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;

    const messages = await chatService.getChatHistory(
      req.user.id,
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json(messages);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ message: 'Error getting chat history' });
  }
};

// Отправить сообщение
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Получаем отправителя и получателя
    const sender = await User.findByPk(req.user.id);
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Проверка 1: обычный пользователь может писать только профессионалу
    if (sender.role === 'user' && receiver.role !== 'professional') {
      return res.status(403).json({ message: 'User can only send messages to professionals' });
    }

    // Проверка 2: только пользователь может начать диалог первым
    const existingMessages = await Message.count({
      where: {
        [Op.or]: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id }
        ]
      }
    });
    if (existingMessages === 0 && sender.role !== 'user') {
      return res.status(403).json({ message: 'Only a user can initiate a conversation with a professional' });
    }

    const message = await chatService.sendMessage(
      req.user.id,
      receiverId,
      content
    );

    // Получаем полную информацию о сообщении с данными отправителя и получателя
    const fullMessage = await Message.findOne({
      where: { id: message.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Получить непрочитанные сообщения
exports.getUnreadMessages = async (req, res) => {
  try {
    const messages = await chatService.getUnreadMessages(req.user.id);
    res.json(messages);
  } catch (error) {
    console.error('Error getting unread messages:', error);
    res.status(500).json({ message: 'Error getting unread messages' });
  }
};

// Отметить сообщения как прочитанные
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    await chatService.markMessagesAsRead(senderId, req.user.id);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

// Эндпоинт для отправки вопроса AI
exports.query = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Получаем ответ от AI сервиса
    const answer = await aiService.getAnswer(question);

    // Сохраняем историю в Google Drive
    await saveChatHistory(userId, question, answer);

    // Отправляем ответ клиенту
    res.json({ answer });
  } catch (error) {
    console.error('Error in chat query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 