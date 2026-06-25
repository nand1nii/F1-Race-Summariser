import express from 'express';
import cors from 'cors';
import racesRouter from './routes/races.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', racesRouter);

app.listen(PORT, () => {
  console.log(`F1 Race Analyzer API running on port ${PORT}`);
});
