const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');

app.use(express.json());
app.use(cors());

// routes
app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);

// health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;