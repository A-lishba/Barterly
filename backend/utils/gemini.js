const fetch = require("node-fetch");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";/**
 * Sends a prompt to Google Gemini (free tier) and returns the raw text response.
 * Throws an error if the API key is missing or the request fails.
 */
async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is missing. Add a free key from https://aistudio.google.com/app/apikey to your .env file."
    );
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API error:", data);
    throw new Error(data?.error?.message || "Gemini API request failed");
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "";
}

/**
 * Strips markdown code fences (```json ... ```) so JSON.parse works reliably.
 */
function cleanJson(raw) {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
}

module.exports = { askGemini, cleanJson };
