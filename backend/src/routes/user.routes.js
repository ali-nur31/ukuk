const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// ... existing routes ...

// Удалить пользователя
router.delete('/:id', protect, (req, res) => {
  userController.deleteUser(req, res);
});

module.exports = router; 