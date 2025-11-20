import {Link} from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar(){
    const {user, logout} = useContext(AuthContext);

     return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/">Search Anime</Link> |{" "}
      {user && <Link to="/profile">Profile</Link>} |{" "}
      {!user ? (
        <>
          <Link to="/login">Login</Link> |{" "}
          <Link to="/signup">Signup</Link>|{" "}
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
}