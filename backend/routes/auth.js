const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/* ---------------- TOKEN ---------------- */

const signToken = (id, role, name, email) =>
  jwt.sign(
    { id, role, name, email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );

/* ---------------- ROLE MAP ---------------- */

const roleMap = {
  patient: 'users',
  doctor: 'doctors',
  receptionist: 'receptionists',
  pharmacist: 'pharmacists',
  admin: 'admins'
};

/* ---------------- REGISTER ---------------- */

router.post('/register', async (req, res) => {
  const { role, email, password, full_name, phone, ...extra } = req.body;

  const safeRole = role?.toLowerCase();

  if (!roleMap[safeRole] || safeRole === 'admin') {
    return res.status(400).json({ message: 'Invalid role for registration' });
  }

  try {
    const table = roleMap[safeRole];

    const [existing] = await db.query(
      `SELECT id FROM ${table} WHERE email = ?`,
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    let sql, params;

    if (safeRole === 'patient') {
      sql = `INSERT INTO users (full_name, email, phone, password_hash, dob, gender, address, blood_group)
             VALUES (?,?,?,?,?,?,?,?)`;

      params = [
        full_name,
        email,
        phone,
        hash,
        extra.dob || null,
        extra.gender || null,
        extra.address || null,
        extra.blood_group || null
      ];

    } else if (safeRole === 'doctor') {
      sql = `INSERT INTO doctors (full_name, email, phone, password_hash, specialization, doctor_type, qualification, license_number)
             VALUES (?,?,?,?,?,?,?,?)`;

      params = [
        full_name,
        email,
        phone,
        hash,
        extra.specialization || null,
        extra.doctor_type || 'junior_resident',
        extra.qualification || null,
        extra.license_number || null
      ];

    } else if (safeRole === 'receptionist') {
      sql = `INSERT INTO receptionists (full_name, email, phone, password_hash, employee_id)
             VALUES (?,?,?,?,?)`;

      params = [
        full_name,
        email,
        phone,
        hash,
        extra.employee_id || null
      ];

    } else if (safeRole === 'pharmacist') {
      sql = `INSERT INTO pharmacists (full_name, email, phone, password_hash, license_number)
             VALUES (?,?,?,?,?)`;

      params = [
        full_name,
        email,
        phone,
        hash,
        extra.license_number || null
      ];
    }

    const [result] = await db.query(sql, params);

    const token = signToken(result.insertId, safeRole, full_name, email);

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: {
        id: result.insertId,
        role: safeRole,
        full_name,
        email,
        phone: phone || null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

/* ---------------- LOGIN ---------------- */

router.post('/login', async (req, res) => {
  const { role, email, password } = req.body;

  const safeRole = role?.toLowerCase();

  if (!roleMap[safeRole]) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const table = roleMap[safeRole];

    const [rows] = await db.query(
      `SELECT * FROM ${table} WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // SAFE bcrypt check
    const isMatch = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // SAFE is_active check (only if column exists)
    if (
      safeRole !== 'admin' &&
      user.is_active !== undefined &&
      user.is_active === 0
    ) {
      return res.status(403).json({
        message: 'Account deactivated. Contact admin.'
      });
    }

    const token = signToken(
      user.id,
      safeRole,
      user.full_name,
      user.email
    );

    const { password_hash, ...userData } = user;

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...userData,
        role: safeRole
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
