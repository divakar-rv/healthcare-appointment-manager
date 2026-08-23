'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'google_access_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'google_refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'google_token_expiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'google_access_token');
    await queryInterface.removeColumn('Users', 'google_refresh_token');
    await queryInterface.removeColumn('Users', 'google_token_expiry');
  }
};
