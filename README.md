# Doctor Appointment System (MedConnect)

A complete MERN stack web application for booking and managing doctor appointments, featuring role-based dashboards for Patients, Doctors, and Admins.

## Features
- **Patient Module**: Register, Login, Browse Doctors, Book Appointments, Cancel Appointments.
- **Doctor Module**: Login, View specific Appointments, Accept/Reject Appointments, Update Profile/Availability.
- **Admin Module**: Dashboard Analytics, Manage entire Doctor Roster.
- **JWT Authentication**: Secure role-based routing.

## Tech Stack
- MongoDB (Mongoose)
- Express.js
- React.js (Vite, Context API, Tailwind CSS)
- Node.js

## Project Structure
```text
├── backend/            # Express Server
│   ├── config/         # DB connection
│   ├── controllers/    # API Logic (admin, doctor, user)
│   ├── middleware/     # Auth & Error handling
│   ├── models/         # Mongoose Schemas (Admin, Doctor, Appointment, User)
│   ├── routes/         # Express Routes
│   ├── server.js       # Main server file
│   └── package.json    # Backend Dependencies
├── frontend/           # React + Vite App
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context (Auth)
│   │   ├── pages/      # Route Pages
│   │   ├── App.jsx     # App component & Router
│   │   ├── main.jsx    # Entry Point
│   ├── index.html      # Vite HTML template
│   ├── tailwind.config.js
│   └── package.json    # Frontend Dependencies
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB URI (Local or MongoDB Atlas)

### Backend Setup
1. Navigate to the `backend` folder: `cd backend`
2. Install dependencies: `npm install`
3. Prepare environment variables:
   Ensure `.env` exists in `backend/` with:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/doctor_appointment
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
   *(Change values as required)*
4. Run the server: `npm run dev` (Runs on `http://localhost:4000`)

### Frontend Setup
1. Open a new terminal.
2. Navigate to the `frontend` folder: `cd frontend`
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Access the application in browser at the URL provided by Vite (usually `http://localhost:5173`).

### Seeding an Admin
To access the Admin dashboard, you must register a User with the role `Admin` directly in your MongoDB database since there's no public endpoint for admin registration to prevent unauthorized access.
1. Register normally using the User Registration page.
2. Open MongoDB Compass (or Mongo Shell).
3. Find your user document in the `users` collection.
4. Update `"role": "Patient"` to `"role": "Admin"`.
5. Login via the Admin option using the same credentials.

## Deployment Guide (Brief)
### Frontend (Vercel/Netlify)
- Set Environment variable in hosting: `VITE_API_BASE_URL=your_backend_url`
- Build command: `npm run build`
- Output directory: `dist`

### Backend (Render/Heroku)
- Add Environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`)
- Build/Start command: `npm start` (Runs `node server.js`)

## API Reference
Please see the inline code comments in `backend/routes/` for endpoint descriptions, access levels, and methods. All protected routes require a `Bearer Token` passed in the `Authorization` header.
