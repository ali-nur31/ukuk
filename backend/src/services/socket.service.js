const socketIO = require('socket.io');
const chatService = require('./chat.service');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Исправленный порт
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware для аутентификации
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log('User connected:', userId);

    // Присоединение к личной комнате
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);

    // Отправка сообщения
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;
        
        // Сохраняем сообщение в базе
        const message = await chatService.sendMessage(userId, receiverId, content);
        
        // Получаем полную информацию о сообщении
        const fullMessage = await chatService.getMessageById(message.id);
        
        // Отправляем сообщение получателю
        io.to(`user_${receiverId}`).emit('new_message', fullMessage);
        
        // Отправляем подтверждение отправителю
        socket.emit('message_sent', fullMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Отметка сообщений как прочитанных
    socket.on('mark_read', async (data) => {
      try {
        const { senderId, timestamp } = data;
        await chatService.markMessagesAsRead(senderId, userId);
        
        // Уведомляем отправителя, что сообщения прочитаны
        io.to(`user_${senderId}`).emit('messages_read', {
          senderId: userId,
          timestamp: timestamp
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
      console.log('User disconnected:', userId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};