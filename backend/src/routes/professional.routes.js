const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

// Публичные маршруты
router.get('/', professionalController.getProfessionals);
router.get('/:id', professionalController.getProfessionalById);

// Защищенные маршруты (только для профессионалов)
router.post(
  '/profile',
  authMiddleware,
  checkRole('professional'),
  professionalController.createProfessionalProfile
);

router.put(
  '/profile',
  authMiddleware,
  checkRole('professional'),
  professionalController.updateProfessionalProfile
);

router.delete(
  '/profile',
  authMiddleware,
  checkRole('professional'),
  professionalController.deleteProfessionalProfile
);

module.exports = router; 