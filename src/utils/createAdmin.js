require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');

async function main() {
  const username = 'aushrukhanitbh';
  const password = 'KHANN@1519?.AUSHRU';
  
  console.log('⏳ Updating admin credentials in database...');
  const hash = await bcrypt.hash(password, 12);

  try {
    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = $2',
      [username.trim(), hash]
    );
    console.log(`✅ Admin user "${username}" successfully updated in database.`);
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
