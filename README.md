# Finite Automata Simulator Web Application 

A web application for designing, simulating, and analyzing finite automata (DFAs and NFAs) 

---

## Description

This application allows users to visually design automata, define states and transitions (including epsilon transitions for NFAs), simulate input strings, and manage automatons by saving them either locally or to a server after authentication.

Additionally, it features an interactive problem-solving mode that enables users to practice automata design and automatically validate their solutions.

---

## Features

- Visual automaton creation (drag-and-drop states and transitions)
- Support for both DFA and NFA types
- Epsilon transitions for NFA
- Local save (JSON download)
- Server save/load functionality (user-based)
- Simulation of input strings
- Interactive problem-solving mode with predefined challenges
- Automatic solution validation (Check Solution feature)
- User registration and login system
- Rename/Delete saved automatons
- Multilingual support (English/Greek)

---

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/egeorgosoulis/finite-automata-web.git
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

## File Structure

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
├── problems.js              # Problem solving functions
├── problemsData.js          # Accepted/Rejected states of problem cards
├── style.css                # Main styling
├── modalSaveLoad.css        # Modal-specific styling
├── translations.json        # Multilingual translations
├── .gitignore               # Files ignored by Git
├── README.md                # Project documentation
├── package.json             # Node.js configuration
└── package-lock.json        # NPM package lock file
```

---

## Usage Guide

- **Register** or **Login** with your email (optional).
- You can use the application in two different modes:

#### *Playground Mode*
- Freely design your own automata.
- Add states and transitions using the UI.
- Experiment with DFAs and NFAs.
- Save/load your automata locally or to the server.
- Test input strings to see if they are accepted.

#### *Problem Mode*
- Select a problem from the learning section.
- Read the problem description and alphabet.
- Design your automaton based on the requirements.
- Use **Check Solution** to validate your solution.
- Iterate and improve your design.

---

## Future Improvements

- Add full accessibility support (ARIA labels, keyboard navigation)
- Implement Undo/Redo for designing automatons
- Extend support to include PDAs and Turing Machines
- Improve mobile UI experience
- Add graphical transition animations
- ~~Include problem-solving challenges for learning and practice~~

---

## Acknowledgment

This project was developed as part of my undergraduate thesis at the University of Thessaly, Department of Computer Science & Telecommunications.

---

## Important Note

This project consists of a frontend and a backend.

- The frontend can run independently (e.g. on GitHub Pages) for automaton design and local save/load functionality.
- Features such as **User Registration, Login, Server Save/Load, and input string simulation** require the backend.
- ⚠️ The backend is deployed on **Render**. Because Render may put the server into an idle state, the **first request may take a few seconds** while the server wakes up.
- If the backend is not running or is temporarily unavailable, backend-dependent features will not function.

For full local setup, please follow the instructions in the [Installation & Setup](#installation--setup) section.

---

## License

This project is licensed under the MIT License.
