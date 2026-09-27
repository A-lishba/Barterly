import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [skillsHave, setSkillsHave] = useState("");
  const [skillsWant, setSkillsWant] = useState("");
   const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/users/me");
      setProfile(data);
      setBio(data.bio || "");
      setSkillsHave((data.skillsHave || []).join(", "));
      setSkillsWant((data.skillsWant || []).join(", "));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bio,
        skillsHave: skillsHave.split(",").map((s) => s.trim()).filter(Boolean),
        skillsWant: skillsWant.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put("/users/me", payload);
      setProfile(data);
      setToast({ message: "Profile updated successfully", type: "success" });
      setTimeout(() => navigate("/matches"), 1200);
    } catch (err) {
      setToast({ message: "Failed to save profile. Try again.", type: "error" });
    }
  };

  if (loading) return <div className="page"><p>Loading profile...</p></div>;

  return (
    <div className="page">
      <h2>My Profile</h2>
      <p className="muted">
        {profile?.name} · {profile?.email}
      </p>

      <form className="profile-form" onSubmit={handleSave}>
        <label>Short bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell others a bit about yourself..."
          maxLength={400}
          rows={3}
        />

        <label>Skills I can teach (comma-separated)</label>
        <input
          type="text"
          value={skillsHave}
          onChange={(e) => setSkillsHave(e.target.value)}
          placeholder="e.g. React, MongoDB, Public Speaking"
        />

        <label>Skills I want to learn (comma-separated)</label>
        <input
          type="text"
          value={skillsWant}
          onChange={(e) => setSkillsWant(e.target.value)}
          placeholder="e.g. UI Design, Data Structures"
        />

        <button type="submit">Save Profile</button>
             <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      </form>
    </div>
  );
}
