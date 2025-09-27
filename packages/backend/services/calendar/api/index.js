// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const eventsRouter = require('../dist/routes/events-sqlite');
const healthRouter = require('../dist/routes/health-sqlite');
const tagsRouter = require('../dist/routes/tags');
const customersRouter = require('../dist/routes/customers');
const { initDatabase } = require('../dist/database/sqlite-connection');

const app = express();

// CORS 설정
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase().catch(console.error);

// Routes
app.use('/api/calendar/health', healthRouter.default);
app.use('/api/calendar/events', eventsRouter.default);
app.use('/api/calendar/tags', tagsRouter.default);
app.use('/api/calendar/customers', customersRouter.default);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Calendar API is running on Vercel!' });
});

module.exports = app;