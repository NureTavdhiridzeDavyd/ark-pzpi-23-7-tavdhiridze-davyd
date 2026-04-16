module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'HiveTrack API',
    version: '1.0.0',
    description: 'Документація REST API для HiveTrack. Авторизація для ЛБ3: X-User-Id.'
  },
  servers: [{ url: '/' }],

  tags: [
    { name: 'Health' },
    { name: 'Groups' },
    { name: 'Lessons' },
    { name: 'Attendance' },
    { name: 'Admin' },
    { name: 'IoT' }
  ],

  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-User-Id',
        description: 'Вкажіть id користувача з таблиці users (роль визначається в БД).'
      }
    }
  },

  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Перевірка працездатності API',
        security: [],
        responses: { 200: { description: 'OK' } }
      }
    },

    '/api/groups': {
      get: {
        tags: ['Groups'],
        summary: 'Отримати список груп',
        security: [],
        responses: { 200: { description: 'OK' } }
      },
      post: {
        tags: ['Groups'],
        summary: 'Створити групу (Admin)',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category', 'startDate', 'endDate'],
                properties: {
                  name: { type: 'string', example: 'Група B-1' },
                  category: { type: 'string', example: 'B' },
                  startDate: { type: 'string', example: '2025-02-01' },
                  endDate: { type: 'string', example: '2025-05-31' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' },
          401: { description: 'Missing X-User-Id header' },
          403: { description: 'Access denied' }
        }
      }
    },

    '/api/lessons/group/{groupId}': {
      get: {
        tags: ['Lessons'],
        summary: 'Отримати заняття групи',
        security: [],
        parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } }
      }
    },

    '/api/lessons': {
      post: {
        tags: ['Lessons'],
        summary: 'Створити заняття (Instructor/Admin)',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['groupId', 'instructorId', 'type', 'topic', 'lessonDateTime'],
                properties: {
                  groupId: { type: 'integer', example: 1 },
                  instructorId: { type: 'integer', example: 2 },
                  type: { type: 'string', example: 'Theory' },
                  topic: { type: 'string', example: 'ПДР: вступ' },
                  lessonDateTime: { type: 'string', example: '2025-02-03 18:00:00' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Business rule violation' },
          401: { description: 'Missing X-User-Id header' },
          403: { description: 'Access denied' },
          404: { description: 'Not found' }
        }
      }
    },

    '/api/attendance': {
      post: {
        tags: ['Attendance'],
        summary: 'Створити запис відвідуваності (Instructor/Admin)',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lessonId', 'studentId', 'status'],
                properties: {
                  lessonId: { type: 'integer', example: 1 },
                  studentId: { type: 'integer', example: 4 },
                  status: { type: 'string', example: 'Present' },
                  comment: { type: 'string', example: 'Без зауважень' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' },
          401: { description: 'Missing X-User-Id header' },
          403: { description: 'Access denied' }
        }
      }
    },

    '/api/attendance/lesson/{lessonId}': {
      get: {
        tags: ['Attendance'],
        summary: 'Відвідуваність заняття',
        security: [],
        parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } }
      }
    },

    '/api/attendance/student/{studentId}': {
      get: {
        tags: ['Attendance'],
        summary: 'Історія відвідуваності студента',
        security: [],
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } }
      }
    },

    '/api/admin/users/{id}/block': {
      post: {
        tags: ['Admin'],
        summary: 'Заблокувати користувача (Admin)',
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK' },
          400: { description: 'Business rule violation' },
          401: { description: 'Missing X-User-Id header' },
          403: { description: 'Access denied' },
          404: { description: 'Not found' }
        }
      }
    },

    '/api/admin/statistics/users': {
      get: {
        tags: ['Admin'],
        summary: 'Статистика користувачів (Admin)',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Missing X-User-Id header' },
          403: { description: 'Access denied' }
        }
      }
    },

    '/api/iot/sessions': {
      get: {
        tags: ['IoT'],
        summary: 'Перевірка IoT endpoint',
        security: [],
        responses: { 200: { description: 'OK' } }
      },
      post: {
        tags: ['IoT'],
        summary: 'Надіслати IoT session report',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                deviceId: 'esp32-01',
                timestamp: '2025-01-01T10:00:00Z',
                data: { speed: 60 }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' } }
      }
    }
  }
};
