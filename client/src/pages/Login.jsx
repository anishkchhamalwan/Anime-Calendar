import { useState, useContext } from "react";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () =>{
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container">
  <div className="card">
    <h2>Login</h2>

    <input
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      placeholder="Password"
      type="password"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button className="btn btn-primary" onClick={handleLogin}>
      Login
    </button>
  </div>
</div>

  );
}