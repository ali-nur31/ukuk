const { User, Professional, ProfessionalType, ProfessionalDetails } = require('../models');
const { Op } = require('sequelize');

// Получить список профессионалов с фильтрацией
exports.getProfessionals = async (req, res) => {
  try {
    const {
      type,
      minRating,
      maxHourlyRate,
      isAvailable,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    const include = [
      {
        model: User,
        attributes: ['id', 'name', 'email']
      },
      {
        model: ProfessionalType,
        attributes: ['id', 'name', 'description']
      },
      {
        model: ProfessionalDetails,
        attributes: ['location', 'languages', 'specializations']
      }
    ];

    // Применяем фильтры
    if (type) {
      include[1].where = { id: type };
    }

    if (minRating) {
      where.rating = { [Op.gte]: minRating };
    }

    if (maxHourlyRate) {
      where.hourlyRate = { [Op.lte]: maxHourlyRate };
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    if (search) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: professionals } = await Professional.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']]
    });

    res.json({
      professionals,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalProfessionals: count
    });
  } catch (error) {
    console.error('Error getting professionals:', error);
    res.status(500).json({ message: 'Error getting professionals list' });
  }
};

// Получить детальную информацию о профессионале
exports.getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await Professional.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: ProfessionalType,
          attributes: ['id', 'name', 'description', 'icon']
        },
        {
          model: ProfessionalDetails,
          attributes: [
            'education',
            'certifications',
            'languages',
            'specializations',
            'about',
            'location',
            'workingHours',
            'contactPhone',
            'website',
            'socialLinks'
          ]
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    res.json({ professional });
  } catch (error) {
    console.error('Error getting professional details:', error);
    res.status(500).json({ message: 'Error getting professional details' });
  }
};

// Создать профиль профессионала
exports.createProfessionalProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      professionalTypeId,
      experience,
      hourlyRate,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      workingHours,
      contactPhone,
      website,
      socialLinks
    } = req.body;

    // Проверяем, существует ли уже профиль
    const existingProfile = await Professional.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Professional profile already exists' });
    }

    // Создаем профиль профессионала
    const professional = await Professional.create({
      userId,
      professionalTypeId,
      experience,
      hourlyRate
    });

    // Создаем детали профиля
    await ProfessionalDetails.create({
      professionalId: professional.id,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      workingHours,
      contactPhone,
      website,
      socialLinks
    });

    res.status(201).json({
      message: 'Professional profile created successfully',
      professional
    });
  } catch (error) {
    console.error('Error creating professional profile:', error);
    res.status(500).json({ message: 'Error creating professional profile' });
  }
};

// Обновить профиль профессионала
exports.updateProfessionalProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      professionalTypeId,
      experience,
      hourlyRate,
      isAvailable,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      workingHours,
      contactPhone,
      website,
      socialLinks
    } = req.body;

    // Находим профиль профессионала
    const professional = await Professional.findOne({ where: { userId } });
    if (!professional) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    // Обновляем основную информацию
    await professional.update({
      professionalTypeId,
      experience,
      hourlyRate,
      isAvailable
    });

    // Обновляем детали профиля
    const details = await ProfessionalDetails.findOne({
      where: { professionalId: professional.id }
    });

    await details.update({
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      workingHours,
      contactPhone,
      website,
      socialLinks
    });

    res.json({
      message: 'Professional profile updated successfully',
      professional
    });
  } catch (error) {
    console.error('Error updating professional profile:', error);
    res.status(500).json({ message: 'Error updating professional profile' });
  }
};

// Удалить профиль профессионала
exports.deleteProfessionalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const professional = await Professional.findOne({ where: { userId } });
    if (!professional) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    await professional.destroy();

    res.json({ message: 'Professional profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional profile:', error);
    res.status(500).json({ message: 'Error deleting professional profile' });
  }
}; 