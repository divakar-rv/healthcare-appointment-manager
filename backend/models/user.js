'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.DoctorProfile, { foreignKey: 'user_id' });
      User.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'patientAppointments' });
      User.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
      User.hasMany(models.Notification, { foreignKey: 'user_id' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    google_access_token: DataTypes.TEXT,
    google_refresh_token: DataTypes.TEXT,
    google_token_expiry: DataTypes.DATE,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};