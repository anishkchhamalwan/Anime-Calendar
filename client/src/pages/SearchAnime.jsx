import { useState } from "react";
import api from "../api/axiosInstance";
import "../styles/search.css";
export default function SearchAnime() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await api.get(`/anime/search?name=${query}`);
    setResults(res.data);
  };

  const addReminder = async (anime) => {
    const startAtUnix = anime.aired?.from
      ? Math.floor(new Date(anime.aired.from).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    await api.post("/google/add-event", {
      title: anime.title,
      startAtUnix,
      animeMALId: anime.mal_id,
    });

    alert("Reminder added!");
  };

  async function removeReminder(animeId) {
  try {
    await api.post("/google/remove-event", {
      animeMALId: animeId
    });
    alert("Reminder removed!");
  } catch (err) {
    console.error(err);
    alert("Failed to remove reminder");
  }
}
  

  return (
     <div className="search-container">
      <h2>Search Anime</h2>

      <div className="search-box">
        <input
          placeholder="Search anime..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={search}>Search</button>
      </div>

      <div className="anime-grid">
        {results.map((anime) => (
          <div key={anime.mal_id} className="anime-card">

            <img
              className="anime-image"
              src={anime.images.jpg.image_url}
              alt={anime.title}
            />

            <div className="anime-info">
              <h3>{anime.title}</h3>

              <div className="anime-meta">
                <p><strong>Status:</strong> {anime.status}</p>
                <p><strong>Episodes:</strong> {anime.episodes || "?"}</p>
              </div>

              <div className="button-group">
                <button
                  className="btn btn-primary"
                  onClick={() => addReminder(anime)}
                >
                  Add Reminder
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => removeReminder(anime.mal_id)}
                >
                  Remove
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
