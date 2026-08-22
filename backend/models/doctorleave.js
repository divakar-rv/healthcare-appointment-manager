'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DoctorLeave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DoctorLeave.init({
    doctor_id: DataTypes.INTEGER,
    leave_date: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'DoctorLeave',
  });
  return DoctorLeave;
};