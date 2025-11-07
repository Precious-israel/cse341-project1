const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description: 'A comprehensive API for managing contacts with full CRUD operations',
      contact: {
        name: 'API Support',
        email: 'support@contactsapi.com'
      },
    },
    servers: [
      {
        url: process.env.RENDER_URL || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      },
    ],
    components: {
      schemas: {
        Contact: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId'
            },
            firstName: {
              type: 'string',
              description: 'First name of the contact',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the contact',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the contact',
              example: 'john.doe@example.com'
            },
            favoriteColor: {
              type: 'string',
              description: 'Favorite color of the contact',
              example: 'Blue'
            },
            birthday: {
              type: 'string',
              format: 'date',
              description: 'Birthday of the contact in YYYY-MM-DD format',
              example: '1990-05-15'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the contact was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the contact was last updated'
            }
          }
        },
        ContactInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'],
          properties: {
            firstName: {
              type: 'string',
              description: 'First name of the contact',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the contact',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the contact',
              example: 'john.doe@example.com'
            },
            favoriteColor: {
              type: 'string',
              description: 'Favorite color of the contact',
              example: 'Blue'
            },
            birthday: {
              type: 'string',
              format: 'date',
              description: 'Birthday of the contact in YYYY-MM-DD format',
              example: '1990-05-15'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;