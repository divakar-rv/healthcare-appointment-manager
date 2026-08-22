'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Appointment.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });
      Appointment.belongsTo(models.User, { foreignKey: 'doctor_id', as: 'doctor' });
      Appointment.hasOne(models.SymptomForm, { foreignKey: 'appointment_id' });
      Appointment.hasOne(models.VisitNote, { foreignKey: 'appointment_id' });
    }
  }
  Appointment.init({
    patient_id: DataTypes.INTEGER,
    doctor_id: DataTypes.INTEGER,
    slot_start: DataTypes.DATE,
    slot_end: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};