import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast.jsx";

export default function SwapRequests() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState({});
  const [linkDraft, setLinkDraft] = useState({});
  const [chatDraft, setChatDraft] = useState({});
  const [toast, setToast] = useState(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("barterly_user");
    if (savedUser) setMyId(JSON.parse(savedUser).id);
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const { data } = await api.get("/swap/mine");
      setSent(data.sent);
      setReceived(data.received);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/swap/${id}/status`, { status });
      setToast({ message: `Request marked as ${status}`, type: "success" });
      fetchSwaps();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to update status", type: "error" });
    }
  };

  const saveNotes = async (id) => {
    const text = notesDraft[id];
    if (!text || !text.trim()) return;
    try {
      await api.put(`/swap/${id}/notes`, { sessionNotes: text });
      setToast({ message: "Session notes saved", type: "success" });
      fetchSwaps();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to save notes", type: "error" });
    }
  };

  const saveMeetingLink = async (id) => {
    const link = linkDraft[id];
    if (!link || !link.trim()) return;
    try {
      await api.put(`/swap/${id}/meeting-link`, { meetingLink: link });
      setToast({ message: "Meeting link saved", type: "success" });
      fetchSwaps();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to save meeting link", type: "error" });
    }
  };

    const cancelRequest = async (id) => {
    if (!window.confirm("Cancel this request? This can't be undone.")) return;
    try {
      await api.delete(`/swap/${id}`);
      setToast({ message: "Request cancelled", type: "success" });
      fetchSwaps();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to cancel request", type: "error" });
    }
  };

  const sendMessage = async (id) => {
    const text = chatDraft[id];
    if (!text || !text.trim()) return;
    try {
      await api.post(`/swap/${id}/message`, { text });
      setChatDraft({ ...chatDraft, [id]: "" });
      fetchSwaps();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to send message", type: "error" });
    }
  };

  if (loading) return <div className="page"><p>Loading your swaps...</p></div>;

  return (
    <div className="page">
      <h2>My Swaps</h2>

      <section>
        <h3>Requests I received</h3>
        {received.length === 0 && <p className="muted">No one has requested to learn from you yet.</p>}
        {received.map((r) => (
          <div className="swap-card" key={r._id}>
            <p>
              <strong>{r.requester?.name}</strong> wants to learn <strong>{r.skill}</strong>
            </p>
            {r.message && <p className="muted">"{r.message}"</p>}
            <p>Status: <span className={`badge badge-${r.status}`}>{r.status}</span></p>

            {r.status === "pending" && (
              <div className="btn-row">
                <button onClick={() => updateStatus(r._id, "accepted")}>Accept</button>
                <button className="btn-outline" onClick={() => updateStatus(r._id, "declined")}>
                  Decline
                </button>
              </div>
            )}

            {r.status === "accepted" && (
              <div className="btn-row">
                <button onClick={() => updateStatus(r._id, "completed")}>Mark Completed</button>
              </div>
            )}

            {(r.status === "accepted" || r.status === "completed") && (
              <>
                <div className="notes-box">
                  <input
                    type="text"
                    placeholder="Paste Google Meet / Zoom link here"
                    value={linkDraft[r._id] ?? r.meetingLink ?? ""}
                    onChange={(e) => setLinkDraft({ ...linkDraft, [r._id]: e.target.value })}
                  />
                  <button onClick={() => saveMeetingLink(r._id)}>Save Meeting Link</button>
                  {r.meetingLink && (
                    <p>
                      🔗 <a href={r.meetingLink} target="_blank" rel="noreferrer">{r.meetingLink}</a>
                    </p>
                  )}

                  <textarea
                    placeholder="Add session notes (what did you cover?)"
                    value={notesDraft[r._id] ?? r.sessionNotes ?? ""}
                    onChange={(e) => setNotesDraft({ ...notesDraft, [r._id]: e.target.value })}
                    rows={2}
                  />
                  <button onClick={() => saveNotes(r._id)}>Save Notes</button>
                  {r.aiSummary && <p className="ai-summary">✨ {r.aiSummary}</p>}
                </div>
                               <Link to={`/inbox?id=${r._id}`} className="btn-outline" style={{ display: "inline-block", marginTop: 8 }}>
                  💬 Open Chat
                </Link>
              </>
            )}
          </div>
        ))}
      </section>

      <section>
        <h3>Requests I sent</h3>
        {sent.length === 0 && <p className="muted">You haven't requested any swaps yet.</p>}
        {sent.map((s) => (
          <div className="swap-card" key={s._id}>
            <p>
              You asked <strong>{s.mentor?.name}</strong> to teach <strong>{s.skill}</strong>
            </p>
            <p>Status: <span className={`badge badge-${s.status}`}>{s.status}</span></p>
            {s.status === "pending" && (
              <button className="btn-outline" onClick={() => cancelRequest(s._id)}>
                Cancel Request
              </button>
            )}
            {s.meetingLink && (
              <p>
                🔗 <a href={s.meetingLink} target="_blank" rel="noreferrer">{s.meetingLink}</a>
              </p>
            )}
            {s.aiSummary && <p className="ai-summary">✨ {s.aiSummary}</p>}
            {(s.status === "accepted" || s.status === "completed") && renderChat(s)}
          </div>
        ))}
      </section>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}