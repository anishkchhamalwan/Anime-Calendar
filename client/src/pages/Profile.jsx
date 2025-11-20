import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosInstance";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);

  // Fetch reminders
  const loadReminders = async () => {
    try {
      const res = await api.get("/google/user-events");
      setReminders(res.data);
    } catch (err) {
      console.error("Error loading reminders:", err);
    }
  };

  

  // Remove a reminder
  const removeReminder = async (animeId) => {
    try {
      await api.post("/google/remove-event", { animeMALId: animeId });
      loadReminders(); // refresh UI
    } catch (err) {
      console.error(err);
      alert("Failed to remove reminder");
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <div className="container">
      {/* Profile Card */}
      <div className="card">
        <h2>Your Profile</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>

        {/* Google Calendar Connect Button */}
        <button 
          className="btn btn-primary"
          onClick={async () => {
            const res = await api.get("/google/auth-url");
            window.location.href = res.data.url;
          }}
        >
          Connect Google Calendar
        </button>

        <p style={{ marginTop: "10px" }}>
          <strong>Google Calendar:</strong> Connected
        </p>

        <h3 style={{ marginTop: "20px" }}>Your Anime Reminders</h3>
      </div>

      {/* Reminders Grid */}
      <div className="reminder-grid">
        {reminders.map((item) => (
          <div key={item.animeMALId} className="reminder-card">
            
            {/* Anime Image */}
            <img
              className="reminder-img"
              src={item.anime.images.jpg.image_url}
              alt={item.anime.title}
            />

            {/* Anime Info */}
            <div className="reminder-info">
              <h3>{item.anime.title}</h3>

              <div className="reminder-meta">
                <p><strong>Status:</strong> {item.anime.status}</p>
                <p><strong>Episodes:</strong> {item.anime.episodes}</p>
              </div>

              {/* Remove Reminder Button */}
              <button
                className="remove-btn"
                onClick={() => removeReminder(item.animeMALId)}
              >
                Remove Reminder
              </button>
            </div>
          </div>
        ))}

        {/* No reminders message */}
        {reminders.length === 0 && (
          <p style={{ marginTop: "20px", color: "#777" }}>
            You haven't added any reminders yet.
          </p>
        )}
      </div>
    </div>
  );
}
