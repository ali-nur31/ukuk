const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register/user', authController.registerUser);
router.post('/register/professional', authController.registerProfessional);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.post('/logout', protect, authController.logoutUser);

module.exports = router; 