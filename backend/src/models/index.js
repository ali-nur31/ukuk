const User = require('./user.model');
const Professional = require('./professional.model');
const ProfessionalType = require('./professionalType.model');
const ProfessionalDetails = require('./professionalDetails.model');

// Define associations
User.hasOne(Professional, { 
  foreignKey: 'userId',
  constraints: true,
  onDelete: 'CASCADE'
});
Professional.belongsTo(User, { 
  foreignKey: 'userId',
  constraints: true,
  onDelete: 'CASCADE'
});

ProfessionalType.hasMany(Professional, { foreignKey: 'professionalTypeId' });
Professional.belongsTo(ProfessionalType, { foreignKey: 'professionalTypeId' });

Professional.hasOne(ProfessionalDetails, { 
  foreignKey: 'professionalId',
  constraints: true,
  onDelete: 'CASCADE'
});
ProfessionalDetails.belongsTo(Professional, { 
  foreignKey: 'professionalId',
  constraints: true,
  onDelete: 'CASCADE'
});

module.exports = {
  User,
  Professional,
  ProfessionalType,
  ProfessionalDetails
}; 