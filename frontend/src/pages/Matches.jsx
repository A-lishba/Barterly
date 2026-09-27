import React, { useState } from "react";
import api from "../api/axios";
import Toast from "../components/Toast.jsx";

export default function Matches() {
  const [skill, setSkill] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [requestMsg, setRequestMsg] = useState({});
  const [toast, setToast] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!skill.trim()) return;
    setLoading(true);
    setError("");
    setMatches([]);
    try {
      const { data } = await api.post("/match/suggest", { skill });
      setMatches(data.matches || []);
      if ((data.matches || []).length === 0) {
        setError(data.note || "No good matches found yet. Try a different skill.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong finding matches");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (mentorId) => {
    setRequesting(mentorId);
    try {
      await api.post("/swap/request", {
        mentorId,
        skill,
        message: requestMsg[mentorId] || `Hi! I'd love to learn ${skill} from you.`,
      });
      setToast({ message: "Swap request sent! Check 'My Swaps' to track it.", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to send request", type: "error" });
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="page">
      <h2>Find a Mentor</h2>
      <p className="muted">Tell Barterly what you want to learn — AI will match you with the best people on the platform.</p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. React Hooks, SQL basics, Public Speaking"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Matches"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="match-list">
        {matches.map((m) => (
          <div className="match-card" key={m.id}>
            <h3>{m.name}</h3>
            <p className="reason">{m.reason}</p>
            <input
              type="text"
              placeholder="Optional message to them..."
              value={requestMsg[m.id] || ""}
              onChange={(e) => setRequestMsg({ ...requestMsg, [m.id]: e.target.value })}
            />
            <button onClick={() => sendRequest(m.id)} disabled={requesting === m.id}>
              {requesting === m.id ? "Sending..." : "Request Swap"}
            </button>
          </div>
        ))}
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}