## Project Proposal

**Project Title:** Barterly — AI-Powered Skill Swap & Micro-Mentorship Matcher

**Problem / Idea Being Addressed:**
Students often want to learn a new skill (e.g., a programming concept, a design tool, a soft skill) but have no structured way to find peers around them who already have that skill and are willing to teach it in exchange for something they need help with in return. This kind of skill-sharing currently happens informally through scattered WhatsApp groups or word of mouth — there's no central platform, no smart matching, and no way to track who taught what. Barterly solves this by giving students a dedicated
platform to list what they can teach and what they want to learn, and uses AI to intelligently match them with the most relevant peer mentor — with a clear reason for each match — instead of just filtering by keyword.

**Main Features:**
- User authentication (JWT-based signup/login)
- Editable user profile: bio, skills you can teach, skills you want to learn
- AI-powered mentor matching — Gemini analyzes all user profiles and ranks the top matches for a requested skill, along with a reason for each match
- Swap request system — send, accept, decline, or cancel a mentorship request
- Meeting link sharing — mentor can attach a Google Meet/Zoom link once a request is accepted
- In-app messaging (Inbox) — a dedicated conversation view for each accepted swap
- Session notes with AI-generated summary — after a session, notes can be logged and
  Gemini auto-generates a short summary of what was learned
- Status tracking for every swap request (pending / accepted / declined / completed)

**Technologies Used:**
- **Frontend:** React (Vite), React Router, Axios, Context API for state management
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **AI Integration:** Google Gemini API (free tier) for mentor matching and session
  summarization
- **Architecture:** REST API
- **Hosting (deployment):** Render (backend), Vercel (frontend), MongoDB Atlas (database)
  