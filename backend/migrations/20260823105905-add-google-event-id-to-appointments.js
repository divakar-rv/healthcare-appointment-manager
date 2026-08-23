'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Appointments', 'google_event_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Appointments', 'google_event_id');
  }
};