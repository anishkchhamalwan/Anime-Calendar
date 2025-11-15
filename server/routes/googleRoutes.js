import express from 'express';
import {verifyToken} from '../middleware/authMiddleware.js';
import {
  getAuthUrl,
  oauthCallback,
  addEvent,
  removeEvent,
  disconnectGoogle
} from "../controllers/googleController.js";

const router = express.Router();

router.get("/auth-url", verifyToken, getAuthUrl);

// Google's redirect/callback URL - user returns here after consent
router.get("/oauth/callback", oauthCallback);

// Protected endpoints to add/remove events
router.post("/add-event", verifyToken, addEvent);
router.post("/remove-event", verifyToken, removeEvent);

// Optional: disconnect (revoke tokens)
router.post("/disconnect", verifyToken, disconnectGoogle);

export default router;