require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('../models');

const app = express();
app.use(cors());
app.use(express.json());

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