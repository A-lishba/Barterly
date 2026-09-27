import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Toast from "../components/Toast.jsx";

export default function Inbox() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(searchParams.get("id") || null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("barterly_user");
    if (savedUser) setMyId(JSON.parse(savedUser).id);
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/swap/mine");
      const all = [...data.sent, ...data.received].filter(
        (s) => s.status === "accepted" || s.status === "completed"
      );
      // remove duplicates just in case, sort newest first
      const unique = Array.from(new Map(all.map((c) => [c._id, c])).values()).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setConversations(unique);
      if (!activeId && unique.length > 0) setActiveId(unique[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!draft.trim() || !activeId) return;
    try {
      await api.post(`/swap/${activeId}/message`, { text: draft.trim() });
      setDraft("");
      fetchConversations();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to send message", type: "error" });
    }
  };

  const active = conversations.find((c) => c._id === activeId);
  const otherPersonName = (conv) => {
    if (!conv) return "";
    return conv.requester?.name && conv.requester?._id !== myId
      ? conv.requester.name
      : conv.mentor?.name;
  };

  if (loading) return <div className="page"><p>Loading messages...</p></div>;

  if (conversations.length === 0) {
    return (
      <div className="page">
        <h2>Messages</h2>
        <p className="muted">
          You don't have any active conversations yet. Once a swap request is accepted, your
          chat with that person will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="inbox-layout">
      <div className="conversation-list">
        {conversations.map((c) => (
          <div
            key={c._id}
            className={`conversation-item ${c._id === activeId ? "active" : ""}`}
            onClick={() => setActiveId(c._id)}
          >
            <strong>{otherPersonName(c)}</strong>
            <span className="conv-skill">{c.skill}</span>
            {c.messages?.length > 0 && (
              <p className="conv-preview">
                {c.messages[c.messages.length - 1].text}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="chat-panel">
        {active ? (
          <>
            <div className="chat-panel-header">
              <strong>{otherPersonName(active)}</strong>
              <span className="muted"> · {active.skill}</span>
            </div>

            <div className="chat-panel-thread">
              {(active.messages || []).length === 0 && (
                <p className="muted" style={{ padding: "0 4px" }}>No messages yet — say hi 👋</p>
              )}
              {(active.messages || []).map((m, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${
                    m.sender?._id === myId ? "chat-bubble-mine" : "chat-bubble-theirs"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="chat-input-row chat-panel-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p className="muted">Select a conversation</p>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}