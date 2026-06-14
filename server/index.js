import './env.js';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './middleware/logger.js';
import { requestLogger } from './middleware/logger.middleware.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import instructorsRoutes from './routes/instructors.routes.js';
import lessonsRoutes from './routes/lessons.routes.js';
import testsRoutes from './routes/tests.routes.js';
import postsRoutes from './routes/posts.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import adminRoutes from './routes/admin.routes.js';
import availabilityRoutes from './routes/availability.routes.js';
import studentRequestsRoutes from './routes/studentRequests.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import theoryRoutes from './routes/theory.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection', { message: err?.message, stack: err?.stack });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/student-requests', studentRequestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/theory', theoryRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
