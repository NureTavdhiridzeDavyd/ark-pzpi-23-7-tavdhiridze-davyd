require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./src/swagger');

const lessonsController = require('./src/controllers/lessonsController');
const groupsController = require('./src/controllers/groupsController');
const attendanceController = require('./src/controllers/attendanceController');
const adminController = require('./src/controllers/adminController');
const iotController = require('./src/controllers/iotController');

const { auth, requireRole } = require('./src/middleware/auth');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HiveTrack API працює' });
});

app.get('/', (req, res) => {
  res.send('HiveTrack API працює. Документація: /api-docs');
});

app.get('/api/groups', groupsController.getAllGroups);
app.post('/api/groups', auth, requireRole('Admin'), groupsController.createGroup);

app.get('/api/lessons/group/:groupId', lessonsController.getLessonsByGroup);
app.post('/api/lessons', auth, requireRole('Instructor', 'Admin'), lessonsController.createLesson);

app.post('/api/attendance', auth, requireRole('Instructor', 'Admin'), attendanceController.createAttendance);
app.get('/api/attendance/lesson/:lessonId', attendanceController.getAttendanceByLesson);
app.get('/api/attendance/student/:studentId', attendanceController.getAttendanceByStudent);

app.post('/api/admin/users/:id/block', auth, requireRole('Admin'), adminController.blockUser);
app.get('/api/admin/statistics/users', auth, requireRole('Admin'), adminController.getUserStatistics);

app.use('/api/iot', iotController);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
