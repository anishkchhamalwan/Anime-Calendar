import { useState, useContext } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");     

  const handleSignup = async () => {
    try {
      await api.post("/auth/signup", { username, email, password });
      alert("Account created. Please login.");
      navigate("/login");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
      <h2>Signup</h2>

      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <br />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button className="btn btn-primary" onClick={handleSignup}>Signup</button>
    </div>
    </div>
  );
}