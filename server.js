require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected - AWS Mumbai for global access'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => res.send('Task Manager API - Worldwide from Mumbai!'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));