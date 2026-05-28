import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import instructorsRoutes from './routes/instructors.routes.js';
import lessonsRoutes from './routes/lessons.routes.js';
import testsRoutes from './routes/tests.routes.js';
import postsRoutes from './routes/posts.routes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/posts', postsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
