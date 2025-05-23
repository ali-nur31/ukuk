const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Professional = require('./professional.model');

const ProfessionalDetails = sequelize.define('ProfessionalDetails', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  professionalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Professional,
      key: 'id'
    }
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  certifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  specializations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workingHours: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' }
    }
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  socialLinks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  timestamps: true
});

// Define association
ProfessionalDetails.belongsTo(Professional, { foreignKey: 'professionalId' });

module.exports = ProfessionalDetails; 