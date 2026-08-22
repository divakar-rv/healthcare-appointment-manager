'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DoctorProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DoctorProfile.init({
    user_id: DataTypes.INTEGER,
    specialisation: DataTypes.STRING,
    working_hours: DataTypes.JSON,
    slot_duration_minutes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DoctorProfile',
  });
  return DoctorProfile;
};