import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <Logo size={30} />
        <span>Barterly</span>
      </Link>
      {user ? (
        <div className="nav-links">
          <Link to="/profile">Profile</Link>
          <Link to="/matches">Find a Mentor</Link>
          <Link to="/swaps">My Swaps</Link>
          <Link to="/inbox">Messages</Link>
          <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
          <button className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn-outline">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
