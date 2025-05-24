const socketIO = require('socket.io');
const chatService = require('./chat.service');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Присоединение к личной комнате
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Отправка сообщения
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        
        // Сохраняем сообщение в базе
        const message = await chatService.sendMessage(senderId, receiverId, content);
        
        // Отправляем сообщение получателю
        io.to(`user_${receiverId}`).emit('new_message', message);
        
        // Отправляем подтверждение отправителю
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Отметка сообщений как прочитанных
    socket.on('mark_read', async (data) => {
      try {
        const { senderId, receiverId } = data;
        await chatService.markMessagesAsRead(senderId, receiverId);
        
        // Уведомляем отправителя, что сообщения прочитаны
        io.to(`user_${senderId}`).emit('messages_read', { receiverId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
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