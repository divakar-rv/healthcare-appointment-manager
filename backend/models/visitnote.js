'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VisitNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VisitNote.belongsTo(models.Appointment, { foreignKey: 'appointment_id' });
    }
  }
  VisitNote.init({
    appointment_id: DataTypes.INTEGER,
    doctor_notes: DataTypes.TEXT,
    prescription: DataTypes.JSON,
    post_visit_summary: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'VisitNote',
  });
  return VisitNote;
};