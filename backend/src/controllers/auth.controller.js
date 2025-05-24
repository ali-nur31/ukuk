const jwt = require('jsonwebtoken');
const { User, Professional, ProfessionalType, ProfessionalDetails } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Регистрация обычного пользователя
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Проверяем наличие обязательных полей
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await User.findOne({ 
      where: { 
        email,
        deletedAt: null
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      isVerified: true // Устанавливаем как верифицированного сразу
    });

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Регистрация профессионала
exports.registerProfessional = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      professionalTypeName,
      experience,
      hourlyRate,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      contactPhone,
      website,
      socialLinks
    } = req.body;

    // Проверяем существование пользователя, включая мягко удаленных
    const existingUser = await User.findOne({
      where: {
        email,
        [Op.or]: [
          { deletedAt: null },
          { deletedAt: { [Op.gt]: new Date() } }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Проверяем существование типа профессионала
    const professionalType = await ProfessionalType.findOne({ where: { name: professionalTypeName } });
    if (!professionalType) {
      return res.status(400).json({ message: 'Invalid professional type' });
    }

    // Если пользователь был мягко удален, восстанавливаем его
    const softDeletedUser = await User.findOne({
      where: {
        email,
        deletedAt: { [Op.ne]: null }
      },
      paranoid: false
    });

    if (softDeletedUser) {
      // Восстанавливаем пользователя
      await softDeletedUser.restore();
      // Обновляем данные
      await softDeletedUser.update({
        password,
        firstName,
        lastName,
        role: 'professional'
      });

      // Создаем или обновляем профиль профессионала
      const [professional] = await Professional.findOrCreate({
        where: { userId: softDeletedUser.id },
        defaults: {
          professionalTypeId: professionalType.id,
          hourlyRate
        }
      });

      // Обновляем детали профессионала
      const [details] = await ProfessionalDetails.findOrCreate({
        where: { professionalId: professional.id },
        defaults: {
          education,
          certifications,
          languages,
          specializations,
          about,
          location,
          contactPhone,
          website,
          socialLinks
        }
      });

      // Генерируем новый токен
      const token = jwt.sign(
        { 
          id: softDeletedUser.id,
          role: softDeletedUser.role,
          email: softDeletedUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Professional account restored successfully',
        token,
        user: {
          id: softDeletedUser.id,
          email: softDeletedUser.email,
          firstName: softDeletedUser.firstName,
          lastName: softDeletedUser.lastName,
          role: softDeletedUser.role
        },
        professional: {
          id: professional.id,
          type: professionalType.name,
          hourlyRate
        }
      });
    }

    // Создаем нового пользователя
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'professional'
    });

    // Создаем профиль профессионала
    const professional = await Professional.create({
      userId: user.id,
      professionalTypeId: professionalType.id,
      hourlyRate
    });

    // Создаем детали профессионала
    await ProfessionalDetails.create({
      professionalId: professional.id,
      education,
      certifications,
      languages,
      specializations,
      about,
      location,
      contactPhone,
      website,
      socialLinks
    });

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Professional registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      professional: {
        id: professional.id,
        type: professionalType.name,
        hourlyRate
      }
    });
  } catch (error) {
    console.error('Professional registration error:', error);
    res.status(500).json({ message: 'Error registering professional' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get additional data based on user role
    let additionalData = {};
    if (user.role === 'professional') {
      const professional = await Professional.findOne({
        where: { userId: user.id },
        include: [
          {
            model: ProfessionalType,
            as: 'professionalType',
            attributes: ['name']
          }
        ]
      });
      if (professional) {
        additionalData = {
          professionalId: professional.id,
          professionalType: professional.professionalType.name,
          hourlyRate: professional.hourlyRate
        };
      }
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let response = { user };

    // If user is a professional, include professional profile
    if (user.role === 'professional') {
      const professional = await Professional.findOne({
        where: { userId: user.id },
        include: [
          {
            model: ProfessionalType,
            as: 'professionalType',
            attributes: ['id', 'name']
          },
          {
            model: ProfessionalDetails,
            as: 'details',
            attributes: [
              'education',
              'certifications',
              'languages',
              'specializations',
              'about',
              'location',
              'contactPhone',
              'website',
              'socialLinks'
            ]
          }
        ]
      });

      if (professional) {
        response.professional = professional;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting current user' });
  }
}; 