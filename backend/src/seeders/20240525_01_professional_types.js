'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('ProfessionalTypes', [
      {
        name: 'Адвокат',
        description: 'Предоставляет юридическую помощь и защиту в суде',
        icon: 'lawyer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Юрист',
        description: 'Оказывает юридические консультации и услуги',
        icon: 'legal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Нотариус',
        description: 'Совершает нотариальные действия',
        icon: 'notary',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Медиатор',
        description: 'Помогает в разрешении споров',
        icon: 'mediator',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ProfessionalTypes', null, {});
  }
}; 