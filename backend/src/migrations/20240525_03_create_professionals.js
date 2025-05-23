'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Professionals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionalTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionalTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      hourlyRate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verificationStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Добавляем индексы
    await queryInterface.addIndex('Professionals', ['userId']);
    await queryInterface.addIndex('Professionals', ['professionalTypeId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Professionals');
  }
}; 