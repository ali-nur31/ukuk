require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const professionalRoutes = require('./routes/professional.routes');
const professionalTypeRoutes = require('./routes/professionalType.routes');
const http = require('http');
const { initializeSocket } = require('./services/socket.service');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const server = http.createServer(app);

// Инициализация Socket.IO
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/professional-types', professionalTypeRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer(); 