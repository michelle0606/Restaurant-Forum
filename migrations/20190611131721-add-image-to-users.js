'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'image', {
      type: Sequelize.STRING,
      defaultValue: '/images/avatar.png'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'image')
  }
}
