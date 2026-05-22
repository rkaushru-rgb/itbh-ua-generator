const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateLicenseKey } = require('../utils/licenseGen');
const path = require('path');
const crypto = require('crypto');

router.get('/login', (req, res) => {
  const err = req.query.err || null;
  res.render('login', { err, title: 'Access — IT Tech Brothers Hub' });
});

router.post('/login', async (req, res) => {
  const { license_key, hardware_id } = req.body;

  if (!license_key || !hardware_id) {
    return res.render('login', { err: 'missing', title: 'Access — IT Tech Brothers Hub' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM licenses WHERE license_key = $1 AND status = $2',
      [license_key.trim().toUpperCase(), 'active']
    );

    if (result.rows.length === 0) {
      return res.render('login', { err: 'invalid', title: 'Access — IT Tech Brothers Hub' });
    }

    const license = result.rows[0];

    if (license.hardware_id !== hardware_id.trim()) {
      return res.render('login', { err: 'device', title: 'Access — IT Tech Brothers Hub' });
    }

    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    await pool.query(
      'UPDATE licenses SET last_login = NOW(), last_device = $1 WHERE id = $2',
      [deviceInfo.substring(0, 900), license.id]
    );

    req.session.licenseId = license.id;
    req.session.hardwareId = hardware_id.trim();
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { err: 'server', title: 'Access — IT Tech Brothers Hub' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

router.get('/register', (req, res) => {
  res.render('register', { err: null, success: null, title: 'Get License — IT Tech Brothers Hub' });
});

router.post('/register', async (req, res) => {
  const { full_name, email, contact, hardware_id } = req.body;

  if (!full_name || !email || !contact || !hardware_id) {
    return res.render('register', {
      err: 'Please fill in all required fields.',
      success: null,
      title: 'Get License — IT Tech Brothers Hub'
    });
  }

  if (!req.files || !req.files.picture) {
    return res.render('register', {
      err: 'Profile picture is required.',
      success: null,
      title: 'Get License — IT Tech Brothers Hub'
    });
  }

  try {
    const dupCheck = await pool.query(
      `SELECT id,
        CASE WHEN email = $1 THEN 'email'
             WHEN contact = $2 THEN 'contact'
             WHEN hardware_id = $3 THEN 'hardware'
        END as dup_field
       FROM licenses
       WHERE email = $1 OR contact = $2 OR hardware_id = $3
       LIMIT 1`,
      [email.trim().toLowerCase(), contact.trim(), hardware_id.trim()]
    );

    if (dupCheck.rows.length > 0) {
      const field = dupCheck.rows[0].dup_field;
      const msgs = { email: 'This email is already registered.', contact: 'This contact number is already registered.', hardware: 'This device is already registered.' };
      return res.render('register', {
        err: msgs[field] || 'Duplicate entry detected.',
        success: null,
        title: 'Get License — IT Tech Brothers Hub'
      });
    }

    const pic = req.files.picture;
    const ext = path.extname(pic.name).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowed.includes(ext)) {
      return res.render('register', {
        err: 'Only JPG, PNG, or WEBP images are accepted.',
        success: null,
        title: 'Get License — IT Tech Brothers Hub'
      });
    }

    const picName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const picPath = path.join(__dirname, '../../uploads', picName);
    await pic.mv(picPath);

    let licenseKey;
    let attempts = 0;
    do {
      licenseKey = generateLicenseKey();
      const exists = await pool.query('SELECT id FROM licenses WHERE license_key = $1', [licenseKey]);
      if (exists.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);

    await pool.query(
      `INSERT INTO licenses (license_key, full_name, email, contact, picture_path, hardware_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [licenseKey, full_name.trim(), email.trim().toLowerCase(), contact.trim(), `/uploads/${picName}`, hardware_id.trim()]
    );

    res.render('register', {
      err: null,
      success: licenseKey,
      title: 'Get License — IT Tech Brothers Hub'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', {
      err: 'Server error. Please try again.',
      success: null,
      title: 'Get License — IT Tech Brothers Hub'
    });
  }
});

module.exports = router;
