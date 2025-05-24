const { Message, User } = require('../models');
const { Op } = require('sequelize');

// Получить историю сообщений между двумя пользователями
exports.getChatHistory = async (userId1, userId2, limit = 50, offset = 0) => {
  return await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    },
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
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

// Отправить сообщение
exports.sendMessage = async (senderId, receiverId, content) => {
  return await Message.create({
    senderId,
    receiverId,
    content
  });
};

// Отметить сообщения как прочитанные
exports.markMessagesAsRead = async (senderId, receiverId) => {
  return await Message.update(
    {
      isRead: true,
      readAt: new Date()
    },
    {
      where: {
        senderId,
        receiverId,
        isRead: false
      }
    }
  );
};

// Получить непрочитанные сообщения
exports.getUnreadMessages = async (userId) => {
  return await Message.findAll({
    where: {
      receiverId: userId,
      isRead: false
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}; 