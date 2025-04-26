# 🌐 Finite Automata Simulator Web Application 

A web application for designing, simulating, and analyzing finite automata (DFAs and NFAs) 

---

## 💡 Description

This application allows users to visually design automata, define states and transitions (including epsilon transitions for NFAs), simulate input strings, and manage automatons by saving them either locally or to a server after authentication.

---

## 📊 Features

- Visual automaton creation (drag-and-drop states and transitions)
- Support for both DFA and NFA types
- Epsilon transitions for NFA
- Local save (JSON download)
- Server save/load functionality (user-based)
- Simulation of input strings
- User registration and login system
- Rename/Delete saved automatons
- Multilingual support (English/Greek)

> **Note**: Accessibility (ARIA, keyboard navigation) and Undo/Redo functionality are planned for future versions.

---

## 📖 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/finite-automata-simulator.git
cd finite-automata-simulator
```
### 2. Setup the Backend
```bash
cd backend
npm install
```
### 3. Create PostgreSQL Database

Create a database (e.g., automata_db).
Create tables with the following schema:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE automata (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL,
  json_data JSONB NOT NULL
);
```

### 4. Configure Environment Variables

Create a .env file inside /backend/:
```bash
DB_USER=your_db_username
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 5. Run the Backend Server
```bash
node index.js
```

Server running at: http://localhost:3000


### 6. Open the Frontend

Open the index.html file directly in your browser

Or use a simple server (e.g., live-server)
```bash
npm install -g live-server
live-server frontend/
```
---

## 📂 File Structure

```
├── backend/
│   ├── auth.js              # Authentication backend
│   ├── database.js          # PostgreSQL configuration
│   ├── saveRoutes.js        # API routes for automata
│   ├── server.js            # Node.js Express server
|   ├── .env                 # Environment variables
│   └── simulators/
│       ├── dfaSimulator.js  # DFA simulation logic
│       └── nfaSimulator.js  # NFA simulation logic
│
├── images/                  # UI icons (e.g., user icon, language flags)
|   └── ...
|
├── index.html               # Main HTML file
├── main.js                  # Main frontend logic
├── saveLoad.js              # Save/Load functions
├── style.css                # Main styling
├── modalSaveLoad.css        # Modal-specific styling
├── translations.json        # Multilingual translations
├── .gitignore               # Files ignored by Git
├── README.md                # Project documentation
├── package.json             # Node.js configuration
└── package-lock.json        # NPM package lock file
```

---

## 👥 Usage Guide

- **Register** or **Login** with your email.
- **Create** states and transitions to build your automaton.
- **Save** your automaton locally or to the server.
- **Load** saved automatons at any time.
- **Simulate** input strings to see if they are accepted.

---

## 🚀 Future Improvements

- Add full accessibility support (ARIA labels, keyboard navigation)
- Implement Undo/Redo for designing automatons
- Enhance security with JWT token authentication
- Improve mobile UI experience
- Add graphical transition animations

---

## 🎓 Acknowledgment

This project was developed as part of my undergraduate thesis at the University of Thessaly, Department of Computer Science & Telecommunications.

---

## ⚠️ Important Note

This project includes both a frontend and a backend.

- The frontend (automaton design, local save/load) can run independently (e.g., on GitHub Pages).
- **Backend-dependent features** (User Registration, Login, Server Save/Load, and Simulation of input strings) **require the backend server to be running locally or hosted online**.
- If running only the frontend without the backend, authentication, server-based saving/loading, and simulation will not be available.

To fully experience all features, you must clone the project and run the backend locally as described in the [Installation & Setup](#installation--setup) section.

---

## 🌐 License

This project is licensed under the MIT License.
