# MedGuard AI - System Architecture

## Overview

MedGuard AI is an AI-powered Biomedical Compliance & Predictive Maintenance Platform that helps hospitals monitor, maintain, and manage biomedical equipment through intelligent automation.

The system combines cloud technologies, AI agents, predictive analytics, and compliance monitoring into one centralized dashboard.

---

# High Level Architecture

                    +----------------------+
                    |      React UI        |
                    |   (Vite + React)     |
                    +----------+-----------+
                               |
                               |
                     REST API Requests
                               |
                               v
                  +------------------------+
                  |   Express Server API   |
                  |    (Node.js + TS)      |
                  +-----------+------------+
                              |
          --------------------------------------------
          |                     |                    |
          |                     |                    |
          v                     v                    v

 +----------------+    +----------------+    +-----------------+
 | PostgreSQL DB  |    | Firebase Auth  |    | Gemini AI APIs  |
 | Drizzle ORM    |    | User Login     |    | AI Analysis     |
 +----------------+    +----------------+    +-----------------+

                              |
                              |
                              v

                   AI Processing Layer

       • Predictive Maintenance Agent
       • Compliance Analysis Agent
       • Biomedical Assistant Agent
       • Report Generation Agent

                              |
                              v

                   Results returned to Dashboard

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS
- Motion
- Lucide Icons
- Recharts

---

## Backend

- Node.js
- Express
- TypeScript

---

## Database

- PostgreSQL
- Drizzle ORM

---

## Authentication

- Firebase Authentication

---

## Artificial Intelligence

- Google Gemini AI

Modules:

- Predictive Maintenance
- Compliance Verification
- Equipment Risk Analysis
- AI Recommendations
- Report Generation

---

# Database Tables

- users
- departments
- equipment
- maintenance
- calibration
- notifications
- reports
- ai_activities
- ai_analyses

---

# Application Flow

User Login
↓

Dashboard

↓

Equipment Management

↓

AI Analysis

↓

Risk Prediction

↓

Compliance Verification

↓

Maintenance Recommendation

↓

Reports & Notifications

---

# Security

- Firebase Authentication
- Secure REST APIs
- PostgreSQL
- Environment Variables
- Role-Based Access

---

# Future Improvements

- IoT Sensor Integration
- Real-Time Monitoring
- Mobile Application
- QR Equipment Tracking
- AI Voice Assistant
- Automated Email Alerts