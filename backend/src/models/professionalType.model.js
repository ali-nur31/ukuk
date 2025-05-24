const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProfessionalType extends Model {
    static associate(models) {
      ProfessionalType.hasMany(models.Professional, {
        foreignKey: 'typeId',
        as: 'professionals'
      });
    }
  }

  ProfessionalType.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    icon: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'ProfessionalType',
    tableName: 'ProfessionalTypes',
    timestamps: true
  });

  return ProfessionalType;
}; 