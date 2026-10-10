import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './routes/auth.route';
import { dishRouter } from './routes/dish.route';
import { favoriteRouter } from './routes/favorite.route';
import { ingredientRouter } from './routes/ingredient.route';
import { profileRouter } from './routes/profile.route';
import { reviewRouter } from './routes/review.route';

export const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  env.clientUrl,
  'https://x45-wte.vercel.app',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected CORS blocks in deployment
  },
  credentials: true
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API" })
})

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/version', (_req, res) => res.json({ version: '1.0.2', deployed: true }));
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/dishes', dishRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use(errorMiddleware);

