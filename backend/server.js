require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ---------------- CORS CONFIG ---------------- */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api', require('./routes/clinical'));
app.use('/api', require('./routes/main'));

/* ---------------- HEALTH CHECK ---------------- */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Ojasya Healthcare',
    time: new Date().toISOString()
  });
});

/* ---------------- 404 HANDLER ---------------- */

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Ojasya Backend running on port ${PORT}`);
  console.log(`🔗 Frontend allowed: ${process.env.FRONTEND_URL}`);
});
