import express from 'express';
import{registerUser,loginUser,getProfile} from '../controllers/authController.js';
import {verifyToken} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/profile',verifyToken, getProfile);

export default router;
