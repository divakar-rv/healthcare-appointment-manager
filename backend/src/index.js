require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('../models');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/symptoms', symptomRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });