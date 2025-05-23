'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('ProfessionalTypes', [
      {
        id: '1e9b3c4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a',
        name: 'Юрист',
        description: 'Юридические услуги',
        icon: 'lawyer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2e9b3c4a-5b6c-7d8e-9f0a-1b2c3d4e5f6b',
        name: 'Нотариус',
        description: 'Нотариальные услуги',
        icon: 'notary',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3e9b3c4a-5b6c-7d8e-9f0a-1b2c3d4e5f6c',
        name: 'Адвокат',
        description: 'Адвокатские услуги',
        icon: 'advocate',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ProfessionalTypes', null, {});
  }
}; 