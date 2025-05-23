'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First create the ENUM types
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Users_role" AS ENUM ('user', 'admin', 'professional');
      CREATE TYPE "enum_Users_registrationType" AS ENUM ('regular', 'professional');
    `);

    // Then create the Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'professional'),
        defaultValue: 'user',
        allowNull: false
      },
      registrationType: {
        type: Sequelize.ENUM('regular', 'professional'),
        defaultValue: 'regular',
        allowNull: false
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
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the Users table
    await queryInterface.dropTable('Users');

    // Drop the ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Users_role";
      DROP TYPE IF EXISTS "enum_Users_registrationType";
    `);
  }
}; 