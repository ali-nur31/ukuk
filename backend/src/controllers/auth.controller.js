const jwt = require('jsonwebtoken');
const { User, Professional, ProfessionalType, ProfessionalDetails } = require('../models');

// Регистрация обычного пользователя
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
      registrationType: 'regular'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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
      name,
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

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if professional type exists
    const professionalType = await ProfessionalType.findByPk(professionalTypeId);
    if (!professionalType) {
      return res.status(400).json({ message: 'Invalid professional type' });
    }

    // Create new user with professional role
    const user = await User.create({
      email,
      password,
      name,
      role: 'professional',
      registrationType: 'professional'
    });

    // Create professional profile
    const professional = await Professional.create({
      userId: user.id,
      professionalTypeId,
      experience,
      hourlyRate
    });

    // Create professional details
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Professional registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      professional: {
        id: professional.id,
        type: professionalType.name,
        experience,
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
      { id: user.id },
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
            attributes: ['name']
          }
        ]
      });
      if (professional) {
        additionalData = {
          professionalId: professional.id,
          professionalType: professional.ProfessionalType.name,
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
            attributes: ['id', 'name']
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