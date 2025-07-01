const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');

app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);

// health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;