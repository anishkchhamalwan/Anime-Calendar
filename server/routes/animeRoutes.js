import express from 'express';
import { searchAnime,getTopAiring } from '../controllers/animeController.js';

const router = express.Router();

router.get('/search', searchAnime);
router.get('/top-airing', getTopAiring);

export default router;
