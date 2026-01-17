# Actify
**Daily Action Tracker — Build Streaks, Stay Motivated**

![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.10-FFCA28?style=flat&logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat&logo=pwa&logoColor=white)

---

## Overview

**Actify** is a mobile-first Progressive Web App designed to help users track daily small actions and build lasting habits. Unlike complex project management tools, Actify focuses on simplicity and consistency—tracking small, daily actions that compound over time.

Built with Angular and Firebase, the app offers a seamless offline-first experience with AI-powered motivational messages to keep users engaged and on track.

---

## Key Features

✅ **Smart Task Sorting** — Automatically separates daily tasks from pending ones  
🎨 **Visual Urgency** — Color-coded indicators for pending tasks  
🤖 **AI Motivation** — Personalized encouragement using Google Gemini  
📱 **Progressive Web App** — Installable on mobile devices with offline support  
📊 **Streak Tracking** — Visual history of completed actions  
🌙 **Dark Mode Support** — Optimized for all lighting conditions  
⚡ **Clean UX** — Minimalist design focused on quick interactions

---

## Screenshots
<img width="300" height="auto" alt="daily" src="https://github.com/user-attachments/assets/3442949e-10cc-46d8-9a71-9503cc8a78fb" />
<img width="300" height="auto" alt="history" src="https://github.com/user-attachments/assets/a90f08e8-265e-4450-80ca-fca356fea9f0" />
<img width="300" height="auto" alt="stats" src="https://github.com/user-attachments/assets/0897d0cd-d7cd-4d3e-b070-eed0c5072a3a" />

---

## Tech Stack

**Frontend:**
- Angular 20.3
- TypeScript 5.9
- TailwindCSS 3.4
- RxJS 7.8

**Backend & Services:**
- Firebase 11.10 (Firestore, Authentication)
- Firebase Admin SDK 13.6
- Google Gemini AI 0.24

**PWA & Tooling:**
- Angular Service Worker
- Netlify (Hosting & Functions)
- Jasmine & Karma (Testing)

---

## How It Works

Actify distinguishes between **"Today's"** tasks and **"Pending"** items, using color-coded urgency to help users prioritize effectively:

1. **Add Actions** — Users create small, actionable tasks
2. **Smart Categorization** — Tasks are automatically sorted into "Today" or "Pending"
3. **Visual Feedback** — Pending tasks display urgency indicators based on how long they've been waiting
4. **AI Motivation** — Google Gemini generates personalized motivational messages
5. **Track Progress** — The "History" feature visualizes completed actions and streaks
6. **Offline Support** — PWA capabilities ensure the app works without internet

---

## Installation / Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase account

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/actify.git
   cd actify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory (see Environment Variables section below)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open the app**  
   Navigate to `http://localhost:8888` (Netlify Dev) or the port shown in your terminal

---

## Environment Variables

The following environment variables are required for the application to function:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** Never commit your `.env` file to version control. Add it to `.gitignore`.

---

## Usage Guide

### Adding a New Action
1. Navigate to the "Daily" tab
2. Click the "+" button
3. Enter your action title
4. Press Enter or click "Add"

### Completing an Action
- Click the checkbox next to any action to mark it as done
- Completed actions move to the "History" tab

### Viewing History
- Navigate to the "History" tab to see all completed actions
- Swipe left/right or use arrow buttons to navigate between dates

### Checking Stats
- Navigate to the "Stats" tab to view:
  - Daily completion rates
  - Streak information
  - Performance trends

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with Netlify Dev |
| `npm run build` | Build production bundle |
| `npm run watch` | Build in watch mode |
| `npm test` | Run unit tests with Karma |

---

## Roadmap / Future Improvements

The following features are **planned** for future releases:

- 🔔 **Push Notifications** — Reminders for pending tasks
- 📈 **Advanced Analytics** — Weekly/monthly performance reports
- 🏆 **Achievements System** — Gamification with badges and rewards
- 👥 **Social Features** — Share streaks with friends
- 🔄 **Recurring Tasks** — Support for daily/weekly habits
- 🌍 **Multi-language Support** — Internationalization
- 📤 **Data Export** — Export history to CSV/JSON

---

## What I Learned

Building Actify provided valuable experience with:

- **Angular Standalone Components** — Leveraging Angular's modern component architecture
- **Firebase Integration** — Real-time data syncing and authentication
- **PWA Development** — Service workers, offline-first strategies, and installability
- **AI Integration** — Working with Google Gemini API for dynamic content generation
- **State Management** — Using RxJS for reactive data flows
- **Mobile-First Design** — Creating responsive, touch-friendly interfaces with TailwindCSS
- **Performance Optimization** — Achieving high Lighthouse scores through lazy loading and caching

---

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT (recommended)

---

## Contact

**Dhaval** — [GitHub](https://github.com/DhavalCK)

Project Link: [https://github.com/DhavalCK/actify](https://github.com/DhavalCK/actify)  
Live Demo: [https://actify-daily.netlify.app/](https://actify-daily.netlify.app/)
