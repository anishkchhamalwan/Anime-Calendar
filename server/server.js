import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import animeRoutes from './routes/animeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import googleRoutes from './routes/googleRoutes.js';

dotenv.config();
const app = express();

//app.use(cors());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://anime-calendar-backend.onrender.com",
    "https://anime-calendar.vercel.app"
  ],
  credentials: true
}));


app.use(express.json());

app.use('/api/anime', animeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/google', googleRoutes);

app.get('/',(req,res) => res.send('Anime Calendar API is running'));

app.use((req, res) => {
    res.status(404).send({ message: 'Endpoint Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});