import {google} from 'googleapis';
import {createOAuthClient} from '../utils/googleClient.js';
import pool from '../config/db.js';
import jwt from "jsonwebtoken";


const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export const getAuthUrl = async (req, res) => {
  try {
    const oauth2Client = createOAuthClient();

    // Create a short-lived signed token with user id
    const stateToken = jwt.sign(
      { uid: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state: stateToken,  // <-- important
    });

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create auth url" });
  }
};


export const oauthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!state) return res.status(400).send("Missing state to link account");

    // Decode the state token to get the user id
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded.uid;

    const oauth2Client = createOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token || null;
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // Save tokens inside DB associated with this user
    await pool.query(
      `UPDATE users SET google_access_token=?, google_refresh_token=?, google_token_expiry=? WHERE id=?`,
      [accessToken, refreshToken, expiryDate, userId]
    );

    // Redirect user to frontend success page
    return res.redirect("http://localhost:3000/google-success");

  } catch (err) {
    console.error("oauthCallback error:", err);
    return res.status(500).send("OAuth callback error");
  }
};

async function authorizeUser(userId) {
  // fetch tokens from DB
  const [rows] = await pool.query("SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id = ?", [userId]);
  if (!rows.length) throw new Error("User not found");
  const { google_access_token, google_refresh_token, google_token_expiry } = rows[0];

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: google_access_token,
    refresh_token: google_refresh_token,
    expiry_date: google_token_expiry ? new Date(google_token_expiry).getTime() : null,
  });

  // If token expired, refresh
  if (google_refresh_token && (!google_access_token || (google_token_expiry && new Date() >= new Date(google_token_expiry)))) {
    const newTokens = await oauth2Client.refreshAccessToken().catch(err => {
      console.error("refreshAccessToken error", err);
      throw err;
    });
    const tokens = newTokens.credentials;
    // save new tokens
    await pool.query("UPDATE users SET google_access_token = ?, google_token_expiry = ? WHERE id = ?", [
      tokens.access_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null, userId
    ]);
    oauth2Client.setCredentials(tokens);
  }

  return oauth2Client;
}


export const addEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, startAtUnix, endAtUnix } = req.body;
    // startAtUnix expected as seconds since epoch (AniList/Jikan often give seconds)
    if (!startAtUnix || !title) return res.status(400).json({ message: "Missing fields" });

    const oauth2Client = await authorizeUser(userId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startIso = new Date(startAtUnix * 1000).toISOString();
    const endIso = endAtUnix ? new Date(endAtUnix * 1000).toISOString() : new Date((startAtUnix + 60*60) * 1000).toISOString();

    const event = {
      summary: title,
      description: description || "Anime episode reminder",
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      // optionally add reminders:
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 30 }]
      }
    };

    const resp = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    const eventId = resp.data.id;

    // store mapping user->anime->eventId if provided (you may pass animeId)
    if (req.body.animeMALId) {
      await pool.query(
        `INSERT INTO user_events (user_id, anime_mal_id, event_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE event_id = ?`,
        [userId, req.body.animeMALId, eventId, eventId]
      );
    }

    res.json({ message: "Event created", eventId, htmlLink: resp.data.htmlLink });
  } catch (err) {
    console.error("addEvent error", err);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const removeEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, animeMALId } = req.body;
    if (!eventId && !animeMALId) return res.status(400).json({ message: "Provide eventId or animeMALId" });

    const oauth2Client = await authorizeUser(userId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    let idToDelete = eventId;
    if (!idToDelete && animeMALId) {
      const [rows] = await pool.query("SELECT event_id FROM user_events WHERE user_id = ? AND anime_mal_id = ?", [userId, animeMALId]);
      if (!rows.length) return res.status(404).json({ message: "No event found for that anime" });
      idToDelete = rows[0].event_id;
    }

    await calendar.events.delete({ calendarId: "primary", eventId: idToDelete });

    if (animeMALId) {
      await pool.query("DELETE FROM user_events WHERE user_id = ? AND anime_mal_id = ?", [userId, animeMALId]);
    }

    res.json({ message: "Event removed" });
  } catch (err) {
    console.error("removeEvent error", err);
    res.status(500).json({ message: "Failed to remove event" });
  }
};


export const disconnectGoogle = async (req, res) => {
  try {
    const userId = req.user.id;
    const oauth2Client = createOAuthClient();
    const [rows] = await pool.query("SELECT google_access_token FROM users WHERE id = ?", [userId]);
    const accessToken = rows[0]?.google_access_token;
    if (accessToken) {
      await oauth2Client.revokeToken(accessToken);
    }
    await pool.query("UPDATE users SET google_access_token = NULL, google_refresh_token = NULL, google_token_expiry = NULL WHERE id = ?", [userId]);
    res.json({ message: "Disconnected Google" });
  } catch (err) {
    console.error("disconnectGoogle error", err);
    res.status(500).json({ message: "Failed to disconnect" });
  }
};
