'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn('notifications', 'type', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('notifications', 'isRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('notifications', 'type');
    await queryInterface.removeColumn('notifications', 'isRead');
  }
};
