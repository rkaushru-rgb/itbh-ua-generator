require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, '../../schema/init.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Database schema initialized successfully.');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    await pool.end();
  }
}

init();
