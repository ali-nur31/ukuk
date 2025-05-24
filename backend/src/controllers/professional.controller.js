const { User, Professional, ProfessionalType, ProfessionalDetails } = require('../models');
const { Op } = require('sequelize');
const { uploadToGoogleDrive, deleteFromGoogleDrive, deleteProfessionalFolder } = require('../services/googleDrive.service');

// Получить список профессионалов с фильтрацией
exports.getProfessionals = async (req, res) => {
  try {
    const {
      type,
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
      // order: [['rating', 'DESC']],
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

// Получить всех профессионалов
exports.getAllProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.findAll({
      include: [
        {
          model: ProfessionalDetails,
          as: 'details'
        },
        {
          model: ProfessionalType,
          as: 'professionalType'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        }
      ]
    });

    res.json(professionals);
  } catch (error) {
    console.error('Error getting professionals:', error);
    res.status(500).json({ message: 'Error getting professionals' });
  }
};

// Получить профессионала по ID
exports.getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await Professional.findByPk(id, {
      include: [
        {
          model: ProfessionalDetails,
          as: 'details'
        },
        {
          model: ProfessionalType,
          as: 'professionalType'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    res.json(professional);
  } catch (error) {
    console.error('Error getting professional:', error);
    res.status(500).json({ message: 'Error getting professional' });
  }
};

// Создать профиль профессионала
exports.createProfessionalProfile = async (req, res) => {
  try {
    const {
      typeId,
      experience,
      education,
      specialization,
      languages
    } = req.body;

    // Проверяем существование типа профессионала
    const professionalType = await ProfessionalType.findByPk(typeId);
    if (!professionalType) {
      return res.status(400).json({ message: 'Invalid professional type' });
    }

    // Создаем запись профессионала
    const professional = await Professional.create({
      userId: req.user.id,
      typeId
    });

    let profilePhoto = null;
    if (req.file) {
      // Получаем данные пользователя для имени папки
      const user = await User.findByPk(req.user.id);
      const professionalName = `${user.firstName}_${user.lastName}`.replace(/\s+/g, '_');
      
      // Загружаем фото в Google Drive
      profilePhoto = await uploadToGoogleDrive(req.file, professional.id, professionalName);
    }

    // Создаем детали профессионала
    const details = await ProfessionalDetails.create({
      professionalId: professional.id,
      experience,
      education,
      specialization,
      languages,
      profilePhoto
    });

    // Получаем полную информацию о созданном профессионале
    const createdProfessional = await Professional.findByPk(professional.id, {
      include: [
        {
          model: ProfessionalDetails,
          as: 'details'
        },
        {
          model: ProfessionalType,
          as: 'type'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        }
      ]
    });

    res.status(201).json(createdProfessional);
  } catch (error) {
    console.error('Error creating professional profile:', error);
    res.status(500).json({ message: 'Error creating professional profile' });
  }
};

// Обновить профиль профессионала
exports.updateProfessionalProfile = async (req, res) => {
  try {
    const professional = await Professional.findOne({
      where: { userId: req.user.id }
    });

    if (!professional) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    // Обновляем данные профиля
    await professional.update(req.body);

    res.json({ message: 'Professional profile updated successfully', professional });
  } catch (error) {
    console.error('Error updating professional profile:', error);
    res.status(500).json({ message: 'Error updating professional profile' });
  }
};

// Удалить профиль профессионала
exports.deleteProfessionalProfile = async (req, res) => {
  try {
    const professional = await Professional.findOne({
      where: { userId: req.user.id }
    });

    if (!professional) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    // Удаляем папку профессионала и все файлы в ней
    await deleteProfessionalFolder(professional.id);

    // Удаляем детали профессионала
    await ProfessionalDetails.destroy({
      where: { professionalId: professional.id }
    });

    // Удаляем запись профессионала
    await professional.destroy();

    res.json({ message: 'Professional profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional profile:', error);
    res.status(500).json({ message: 'Error deleting professional profile' });
  }
};

// Обновить профиль профессионала
exports.updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      experience,
      hourlyRate,
      isAvailable,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      contactPhone,
      socialLinks
    } = req.body;

    // Проверяем, существует ли профессионал
    const professional = await Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Проверяем, что пользователь обновляет свой собственный профиль
    if (professional.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Обновляем основную информацию профессионала
    await professional.update({
      experience,
      hourlyRate,
      isAvailable
    });

    // Обновляем детали профессионала
    const [professionalDetails] = await ProfessionalDetails.findOrCreate({
      where: { professionalId: id }
    });

    await professionalDetails.update({
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      contactPhone,
      socialLinks
    });

    // Получаем обновленные данные
    const updatedProfessional = await Professional.findOne({
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
          model: ProfessionalDetails
        }
      ]
    });

    res.json(updatedProfessional);
  } catch (error) {
    console.error('Error updating professional:', error);
    res.status(500).json({ message: 'Error updating professional' });
  }
};

// Удалить профиль профессионала
exports.deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли профессионал
    const professional = await Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Проверяем, что пользователь удаляет свой собственный профиль
    if (professional.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    // Удаляем профиль профессионала
    await professional.destroy();

    res.json({ message: 'Professional profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional:', error);
    res.status(500).json({ message: 'Error deleting professional' });
  }
};

// Загрузка фото профиля
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const professional = await Professional.findByPk(id, {
      include: [{
        model: ProfessionalDetails,
        as: 'details'
      }, {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    });

    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Загружаем фото в Google Drive
    const professionalName = `${professional.user.firstName}_${professional.user.lastName}`.replace(/\s+/g, '_');
    const photoUrl = await uploadToGoogleDrive(file, professional.id, professionalName);

    // Обновляем URL фото в базе данных
    if (professional.details) {
      await professional.details.update({ profilePhoto: photoUrl });
    } else {
      await ProfessionalDetails.create({
        professionalId: professional.id,
        profilePhoto: photoUrl
      });
    }

    res.json({ message: 'Profile photo uploaded successfully', photoUrl });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Error uploading profile photo', error: error.message });
  }
}; 