const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const ProfessionalType = require('./professionalType.model');

const Professional = sequelize.define('Professional', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  professionalTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ProfessionalType,
      key: 'id'
    }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Experience in years'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (professional) => {
      // Проверяем, что пользователь имеет роль professional
      const user = await User.findByPk(professional.userId);
      if (!user || user.role !== 'professional') {
        throw new Error('User must have professional role to create professional profile');
      }
    }
  }
});

// Define associations
Professional.belongsTo(User, { 
  foreignKey: 'userId',
  constraints: true,
  onDelete: 'CASCADE'
});
Professional.belongsTo(ProfessionalType, { foreignKey: 'professionalTypeId' });

module.exports = Professional; 