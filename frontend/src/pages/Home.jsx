import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="hero">
     <div style={{ marginBottom: 12 }}>
        <Logo size={64} />
      </div>
      <h1>Barterly</h1>
      <p className="tagline">Swap skills, not fees. AI-matched micro-mentorship for students.</p>
      <p className="muted">
        Teach what you know. Learn what you don't. Barterly's AI matches you with the best
        mentor on the platform for any skill you want to learn — no money involved.
      </p>
      {user ? (
        <Link to="/matches" className="btn-primary">
          Find a Mentor
        </Link>
      ) : (
        <div className="btn-row">
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn-outline">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
