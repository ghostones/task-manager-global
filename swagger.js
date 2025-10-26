// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'OutfitBloom API',
      version: '1.0.0',
      description: 'Fashion intelligence backend',
    },
  },
  apis: ['./routes/*.js'], // Your route files must have JSDoc Swagger comments
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
