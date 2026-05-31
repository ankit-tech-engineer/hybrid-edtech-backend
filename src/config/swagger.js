const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hybrid EdTech - Tutor Marketplace API',
      version: '1.0.0',
      description: 'Production-ready REST API for Student ↔ Tutor marketplace platform with integrated payment processing, verification system, and admin dashboard.',
      contact: {
        name: 'Hybrid EdTech Support',
        email: 'support@hybridedtech.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://hybrid-edtech-backend.onrender.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            phone: {
              type: 'string',
              example: '+919876543210',
            },
            role: {
              type: 'string',
              enum: ['STUDENT', 'TUTOR', 'ADMIN'],
              example: 'STUDENT',
            },
            avatar: {
              type: 'string',
              example: 'https://res.cloudinary.com/cloud/avatar.jpg',
            },
            is_verified: {
              type: 'boolean',
              example: true,
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
          },
        },
        TutorProfile: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            user_id: {
              $ref: '#/components/schemas/User',
            },
            subjects: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Mathematics', 'Physics'],
            },
            mode: {
              type: 'string',
              enum: ['ONLINE', 'OFFLINE', 'BOTH'],
              example: 'BOTH',
            },
            price_per_hour: {
              type: 'number',
              example: 500,
            },
            bio: {
              type: 'string',
              example: 'Experienced tutor with 8 years of teaching',
            },
            experience: {
              type: 'number',
              example: 8,
            },
            trust_score: {
              type: 'number',
              example: 50,
            },
            location: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                },
                area: {
                  type: 'string',
                },
              },
            },
            qualifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: {
                    type: 'string',
                  },
                  field: {
                    type: 'string',
                  },
                  institution: {
                    type: 'string',
                  },
                  year: {
                    type: 'number',
                  },
                  certificate: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            student_id: {
              type: 'string',
            },
            tutor_id: {
              type: 'string',
            },
            mode: {
              type: 'string',
              enum: ['ONLINE', 'OFFLINE'],
            },
            date_time: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
            },
            payment_status: {
              type: 'string',
              enum: ['CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            },
            note: {
              type: 'string',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            booking_id: {
              type: 'string',
            },
            student_id: {
              type: 'string',
            },
            tutor_id: {
              type: 'string',
            },
            razorpay_order_id: {
              type: 'string',
            },
            razorpay_payment_id: {
              type: 'string',
            },
            total_amount: {
              type: 'number',
              description: 'Amount in paise',
            },
            tutor_price: {
              type: 'number',
            },
            platform_fee: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            },
            currency: {
              type: 'string',
              example: 'INR',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/tutor.routes.js',
    './src/routes/booking.routes.js',
    './src/routes/payment.routes.js',
    './src/routes/review.routes.js',
    './src/routes/report.routes.js',
    './src/routes/contact.routes.js',
    './src/routes/upload.routes.js',
    './src/routes/verification.routes.js',
    './src/routes/admin.routes.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
