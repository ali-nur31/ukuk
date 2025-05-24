const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Professional extends Model {
    static associate(models) {
      Professional.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Professional.belongsTo(models.ProfessionalType, {
        foreignKey: 'typeId',
        as: 'professionalType'
      });
      Professional.hasOne(models.ProfessionalDetails, {
        foreignKey: 'professionalId',
        as: 'details'
      });
    }
  }

  Professional.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProfessionalTypes',
        key: 'id'
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
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
    sequelize,
    modelName: 'Professional',
    tableName: 'Professionals',
    timestamps: true
  });

  return Professional;
}; 