const express = require('express');
const router = express.Router();
const professionalTypeController = require('../controllers/professionalType.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

// Получить все типы профессионалов (публичный доступ)
router.get('/', professionalTypeController.getAllProfessionalTypes);

// Получить тип профессионала по ID (публичный доступ)
router.get('/:id', professionalTypeController.getProfessionalTypeById);

// Защищенные маршруты (только для админов)
router.post('/', 
  protect,
  checkRole('admin'),
  professionalTypeController.createProfessionalType
);

router.put('/:id',
  protect,
  checkRole('admin'),
  professionalTypeController.updateProfessionalType
);

router.delete('/:id',
  protect,
  checkRole('admin'),
  professionalTypeController.deleteProfessionalType
);

module.exports = router; 