import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json()); // Добавь обязательно для POST-json

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Новый роут — заглушка для API анализа
app.post('/api/analyze', (req, res) => {
  // Пока вернём заглушку для проверки:
  res.json({ result: 'analyze stub ok', data: req.body });
});

export default app;
