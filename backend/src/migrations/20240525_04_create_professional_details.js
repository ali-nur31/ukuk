'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProfessionalDetails', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      professionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Professionals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      education: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      certifications: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      languages: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      specializations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contactPhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      socialLinks: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      profilePhoto: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Добавляем индекс
    await queryInterface.addIndex('ProfessionalDetails', ['professionalId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProfessionalDetails');
  }
}; 