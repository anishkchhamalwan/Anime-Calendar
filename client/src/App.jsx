import React, { useState } from "react";
import axios from "axios";
import "./styles/App.css";

function App() {
  const [query, setQuery] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/anime/search?name=${query}`);
      console.log(res.data);
      setAnimeList(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch anime App.jsx");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎬 Anime Calender</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {animeList.map((anime) => (
          <div key={anime.mal_id} className="card">
            <img src={anime.images.jpg.image_url} alt={anime.title} />
            <h3>{anime.title}</h3>
            <p>{anime.status}</p>
            <p>Episodes: {anime.episodes || "?"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
