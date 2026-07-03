import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProd ? '*' : (process.env.FRONTEND_URL ?? 'http://localhost:5173'),
}));
app.use(express.json());

app.use('/api', routes);

// In production, serve the built React frontend
if (isProd) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // All non-API routes go to index.html (React Router)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
