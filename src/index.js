import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Загружаем переменные из .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Health check маршрут
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});