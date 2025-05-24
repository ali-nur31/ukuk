const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const { upload } = require('../services/googleDrive.service');

// Публичные маршруты
router.get('/', professionalController.getAllProfessionals);
router.get('/:id', professionalController.getProfessionalById);

// Защищенные маршруты (только для профессионалов)
router.post('/',
  protect,
  checkRole('professional'),
  upload.single('profilePhoto'),
  professionalController.createProfessionalProfile
);

router.put('/profile',
  protect,
  checkRole('professional'),
  upload.single('profilePhoto'),
  professionalController.updateProfessionalProfile
);

router.delete('/profile',
  protect,
  checkRole('professional'),
  professionalController.deleteProfessionalProfile
);

// Эндпоинт для загрузки фото профиля
router.post('/:id/photo',
  protect,
  checkRole('professional'),
  upload.single('photo'),
  professionalController.uploadProfilePhoto
);

// Обновить профиль профессионала (требуется авторизация)
router.put('/:id', protect, professionalController.updateProfessional);

// Удалить профиль профессионала (требуется авторизация)
router.delete('/:id', protect, professionalController.deleteProfessional);

module.exports = router; 