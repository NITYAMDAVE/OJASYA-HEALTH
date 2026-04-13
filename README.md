# 🏥 Ojasya Healthcare — Deployment Guide

## Stack
- **Frontend** → Vercel (React)
- **Backend** → Render (Node/Express)
- **Database** → Railway (MySQL)

---

## Step 1: Railway (Database)

1. Go to railway.app → New Project → MySQL
2. Once created, click the MySQL service → Variables tab
3. Copy the value of MYSQL_URL
4. Go to Query tab and run the contents of backend/config/schema.sql to create all tables

---

## Step 2: Render (Backend)

1. Go to render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start
   - Runtime: Node
4. Environment Variables:
   - NODE_ENV = production
   - MYSQL_URL = (paste from Railway)
   - JWT_SECRET = (any long random string)
   - JWT_EXPIRES_IN = 24h
   - FRONTEND_URL = (your Vercel URL — add after step 3, then redeploy)
5. Deploy — note the URL (e.g. https://ojasya-backend.onrender.com)

---

## Step 3: Vercel (Frontend)

1. Go to vercel.com → New Project → Import your GitHub repo
2. Settings:
   - Root Directory: frontend
   - Framework: Create React App
3. Environment Variable:
   - REACT_APP_API_URL = https://your-backend-name.onrender.com
4. Deploy
5. Copy your Vercel URL → go back to Render → set FRONTEND_URL → redeploy backend

---

## Default Admin Login
Email:    admin@ojasya.com
Password: Admin@123
(Change this after first login!)

---

## Local Development

# Backend
cd backend && cp .env.example .env  # fill in local MySQL details
npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm start
