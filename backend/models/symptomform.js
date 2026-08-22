'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SymptomForm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SymptomForm.belongsTo(models.Appointment, { foreignKey: 'appointment_id' });
    }
  }
  SymptomForm.init({
    appointment_id: DataTypes.INTEGER,
    symptoms_text: DataTypes.TEXT,
    pre_visit_summary: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'SymptomForm',
  });
  return SymptomForm;
};