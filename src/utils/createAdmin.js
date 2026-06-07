require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
  return new Promise(res => rl.question(q, res));
}

async function main() {
  const username = await ask('aushrukhanitbh ');
  const password = await ask('KHANN@1519?.AUSHRU ');
  const hash = await bcrypt.hash(password, 12);

  try {
    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = $2',
      [username.trim(), hash]
    );
    console.log(`✅ Admin user "${username.trim()}" created/updated.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
