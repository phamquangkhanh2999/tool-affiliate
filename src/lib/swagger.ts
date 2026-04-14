import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopee Affiliate AI API',
      version: '1.0.0',
      description: 'API Documentation for Shopee Affiliate AI tool (Next.js 15 App Router)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Đường dẫn đến các file chứa API route của bạn để Swagger tự quét JSDoc comments
  apis: ['./src/app/api/**/*.ts'], 
};

export const getApiDocs = async () => {
  return swaggerJsdoc(options);
};
