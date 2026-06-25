# 🏎️ F1 Race Summariser

An AI-powered web application that transforms Formula 1 race information into concise, easy-to-read summaries. Skip the lengthy race reports and full replays — get the key events, strategies, and highlights of any Grand Prix in seconds.

**🌐 Live Demo:** [f1-race-summariser.vercel.app](https://f1-race-summariser.vercel.app)

---

## 📖 Overview

F1 Race Summariser is built for F1 fans who want to stay up to date without spending hours catching up. Whether you missed a race or just want a quick recap, the app uses AI to condense everything into a clean, readable summary — covering race winners, key overtakes, strategy calls, safety cars, retirements, and more.

---

## ✨ Features

- **AI-generated race summaries** — Key events and outcomes delivered in plain English
- **Race highlights** — Important moments pulled out at a glance
- **Fast recaps** — Catch up on any Grand Prix in seconds
- **Modern UI** — Clean, responsive interface built with React and Tailwind CSS
- **Full-stack architecture** — Decoupled React frontend and Node.js/Express backend
- **Deployed on Vercel** — Ready to use with no setup required

---

## 🗂 Project Structure

```
F1-Race-Summariser/
├── frontend/               # React + Vite client app
│   ├── src/                # Components, pages, and logic
│   ├── index.html
│   └── vite.config.js
├── backend/                # Node.js + Express API server
│   ├── index.js            # Server entry point and routes
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack

### Frontend
- **React** — Component-based UI
- **Vite** — Fast dev server and build tool
- **Tailwind CSS** — Utility-first styling
- **JavaScript** — Primary language (75.7% of the codebase)

### Backend
- **Node.js** — Runtime
- **Express.js** — REST API framework

### Deployment
- **Vercel** — Hosting for both frontend and backend

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/nand1nii/F1-Race-Summariser.git
cd F1-Race-Summariser
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add your API keys:

```env
# Add your AI provider API key here, e.g.:
ANTHROPIC_API_KEY=your_key_here
# or
OPENAI_API_KEY=your_key_here

PORT=3001
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:3001`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | `backend/.env` | Port for the Express server (default: 3001) |
| `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` | `backend/.env` | API key for the AI summarisation model |
| `VITE_API_URL` | `frontend/.env.local` | URL of the backend API |

> ⚠️ Never commit `.env` files. They are already listed in `.gitignore`.

---

## 📦 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start with auto-reload (nodemon) |

### Frontend (`/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

---

## 🌐 Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Fork the repository
2. Import both `frontend/` and `backend/` into Vercel as separate projects (or use a monorepo setup)
3. Set the required environment variables in the Vercel dashboard
4. Update `VITE_API_URL` in the frontend to point to your deployed backend URL

---

## 🤝 Contributing

Contributions are welcome! Some ideas for improvements:

- Add support for selecting specific race sessions (qualifying, sprint, race)
- Add a race calendar to browse past Grands Prix
- Support for driver and constructor standings summaries
- Add sharing functionality (copy summary, share to social)
- Dark/light mode toggle

To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

---

## 📄 License

This project is open source. See the repository for details.

---

> Made with ❤️ by [nand1nii](https://github.com/nand1nii)
