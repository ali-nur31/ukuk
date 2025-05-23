const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const professionalRoutes = require('./professional.routes');
const professionalTypeRoutes = require('./professionalType.routes');

router.use('/auth', authRoutes);
router.use('/professionals', professionalRoutes);
router.use('/professional-types', professionalTypeRoutes);

module.exports = router; 