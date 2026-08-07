<div align="center">

# 🏥 MedGuard AI

### AI-Powered Biomedical Compliance & Predictive Maintenance Platform

<p>
  <strong>Built for modern hospitals to intelligently monitor, manage, and maintain critical medical equipment.</strong>
</p>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📖 Overview

Medical equipment failures can delay treatment, increase maintenance costs, and compromise patient safety.

**MedGuard AI** is an intelligent biomedical equipment management platform that combines **Artificial Intelligence**, **Predictive Maintenance**, **Cloud Database**, and **Compliance Monitoring** into one unified dashboard.

Designed for hospitals and biomedical engineering teams, MedGuard AI enables real-time monitoring of medical assets, AI-assisted decision making, preventive maintenance scheduling, compliance reporting, and centralized equipment management.

---

# ✨ Key Features

## 🤖 AI-Powered Assistant

- AI-powered biomedical assistant
- Equipment diagnostics
- Maintenance recommendations
- Compliance guidance
- AI activity logging

---

## 🏥 Equipment Management

- Equipment inventory
- Asset lifecycle management
- Health score monitoring
- Risk score calculation
- Department-wise categorization
- Manufacturer information
- Equipment search & filtering

---

## 🔧 Predictive Maintenance

- Preventive maintenance scheduling
- Engineer assignment
- Priority management
- Maintenance history
- Status tracking

---

## 📏 Calibration Management

- Calibration scheduling
- Certificate tracking
- Due-date monitoring
- Compliance verification

---

## 📊 Analytics Dashboard

- Equipment health overview
- Operational statistics
- Risk distribution
- Maintenance analytics
- Department insights

---

## 🔔 Smart Notification Center

- Critical alerts
- Maintenance reminders
- Calibration reminders
- Compliance notifications
- User activity logs

---

## 📑 Compliance Reports

Generate professional reports including:

- Compliance Reports
- Maintenance Reports
- Equipment Reports
- Department Reports
- Executive Summary

---

## 🔐 Secure Authentication

- Firebase Authentication
- Google Sign-In
- Protected Routes
- Session Persistence
- Role-based access

---

# 🏗 System Architecture

```
                        Google Login
                             │
                             ▼
                  Firebase Authentication
                             │
                             ▼
                     Express REST API
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
 Equipment Module     Maintenance Module    AI Assistant
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                    PostgreSQL Database
                       (Drizzle ORM)
                             │
                             ▼
                     Analytics Dashboard
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- CSS3
- Lucide React
- Recharts

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL
- Drizzle ORM
- Neon Database

## Authentication

- Firebase Authentication

## Artificial Intelligence

- Google Gemini API

---

# 🗄 Database Schema

The application uses a relational PostgreSQL database.

### Tables

- Users
- Equipment
- Maintenance
- Calibration
- Notifications
- Reports
- Departments
- AI Activities
- AI Analyses

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/shayangonchoudhury-svg/MedGuard-AI.git
```

Go into the project

```bash
cd MedGuard-AI
```

Install dependencies

```bash
npm install
```

Create your environment file

```bash
cp .env.example .env
```

Run the project

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create a `.env` file and configure:

```env
DATABASE_URL=

GEMINI_API_KEY=

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```


---

## Reports

> Add screenshot here

---

# 🎯 Future Improvements

- IoT Medical Device Integration
- Real-time Sensor Monitoring
- QR Code Asset Tracking
- Multi-Hospital Support
- Mobile Application
- AI Failure Prediction
- Automatic Compliance Auditing
- Inventory Forecasting

---

# 👨‍💻 Developed By

**Shayan Gon Choudhury**

Computer Science & Engineering  
KIIT – Kalinga Institute of Industrial Technology

---

# 📜 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project interesting, consider giving it a star!

Made with ❤️ for smarter healthcare.

</div>