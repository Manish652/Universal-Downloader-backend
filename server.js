import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import downloadRoutes from './routes/downloadRoutes.js';
import healthRouter from './routes/healthRoutes.js';
import infoRoutes from './routes/infoRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'https://universal-downloader-dusky.vercel.app' }));
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Backend is live!");
});

app.use('/', infoRoutes);
app.use('/', downloadRoutes);
app.use('/', healthRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
