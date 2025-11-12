const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Contacts API',
        description: 'This is an API for contacts'
    },
    host: 'localhost:3001',
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFlies = ['./routes/index.js']

swaggerAutogen(outputFile, endpointsFlies, doc);