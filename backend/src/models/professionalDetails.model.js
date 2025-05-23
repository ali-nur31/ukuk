const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProfessionalDetails extends Model {
    static associate(models) {
      ProfessionalDetails.belongsTo(models.Professional, {
        foreignKey: 'professionalId',
        as: 'professional'
      });
    }
  }

  ProfessionalDetails.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Professionals',
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
      allowNull: true
    },
    specializations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    socialLinks: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProfessionalDetails',
    tableName: 'ProfessionalDetails',
    timestamps: true
  });

  return ProfessionalDetails;
}; 