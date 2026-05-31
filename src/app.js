require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { errorResponse } = require('./utils/response');

const app = express();

app.set("trust proxy", 1);

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hybrid EdTech API Documentation',
}));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => errorResponse(res, `Route ${req.originalUrl} not found`, 404));

// Global error handler
app.use(errorHandler);

module.exports = app;
