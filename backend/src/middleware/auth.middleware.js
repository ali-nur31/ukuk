const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authController = require('../controllers/auth.controller');

// Middleware для проверки аутентификации
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Проверяем, не находится ли токен в черном списке
    if (authController.isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Проверяем существование пользователя
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Добавляем пользователя в request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Error in auth middleware' });
  }
};

// Middleware для проверки ролей
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 