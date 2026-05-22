const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');

router.get('/login', (req, res) => {
  const err = req.query.err || null;
  res.render('admin/login', { err, title: 'Admin — IT Tech Brothers Hub' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.redirect('/admin/login?err=missing');

  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username.trim()]);
    if (result.rows.length === 0) return res.redirect('/admin/login?err=invalid');

    const admin = result.rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.redirect('/admin/login?err=invalid');

    req.session.adminId = admin.id;
    req.session.adminUser = admin.username;
    res.redirect('/admin');
  } catch (err) {
    console.error('Admin login error:', err);
    res.redirect('/admin/login?err=server');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const [statsRes, recentRes] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM licenses) AS total_licenses,
          (SELECT COUNT(*) FROM licenses WHERE status = 'active') AS active_licenses,
          (SELECT COUNT(*) FROM licenses WHERE status = 'revoked') AS revoked_licenses,
          (SELECT COUNT(*) FROM generated_user_agents) AS total_uas
      `),
      pool.query(`
        SELECT l.*, COUNT(g.id) AS ua_count
        FROM licenses l
        LEFT JOIN generated_user_agents g ON g.license_id = l.id
        GROUP BY l.id
        ORDER BY l.created_at DESC
        LIMIT 10
      `)
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard — IT Tech Brothers Hub',
      admin: req.session.adminUser,
      stats: statsRes.rows[0],
      recent: recentRes.rows
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send('Server error');
  }
});

router.get('/licenses', adminAuth, async (req, res) => {
  try {
    const search = req.query.q || '';
    const status = req.query.status || '';
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    let where = '1=1';
    const params = [];
    let pIdx = 1;

    if (search) {
      where += ` AND (l.full_name ILIKE $${pIdx} OR l.email ILIKE $${pIdx} OR l.contact ILIKE $${pIdx} OR l.license_key ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }
    if (status) {
      where += ` AND l.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM licenses l WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(perPage, offset);
    const listRes = await pool.query(`
      SELECT l.*, COUNT(g.id) AS ua_count
      FROM licenses l
      LEFT JOIN generated_user_agents g ON g.license_id = l.id
      WHERE ${where}
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `, params);

    res.render('admin/licenses', {
      title: 'Licenses — Admin — IT Tech Brothers Hub',
      admin: req.session.adminUser,
      licenses: listRes.rows,
      search,
      status,
      page,
      perPage,
      total,
      pages: Math.ceil(total / perPage)
    });
  } catch (err) {
    console.error('Admin licenses error:', err);
    res.status(500).send('Server error');
  }
});

router.get('/license/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, COUNT(g.id) AS ua_count
      FROM licenses l
      LEFT JOIN generated_user_agents g ON g.license_id = l.id
      WHERE l.id = $1
      GROUP BY l.id
    `, [req.params.id]);

    if (result.rows.length === 0) return res.redirect('/admin/licenses');

    const uaHistory = await pool.query(
      'SELECT * FROM generated_user_agents WHERE license_id = $1 ORDER BY generated_at DESC LIMIT 50',
      [req.params.id]
    );

    res.render('admin/license-detail', {
      title: 'License Detail — Admin — IT Tech Brothers Hub',
      admin: req.session.adminUser,
      license: result.rows[0],
      uas: uaHistory.rows
    });
  } catch (err) {
    console.error('License detail error:', err);
    res.status(500).send('Server error');
  }
});

router.post('/license/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'revoked'];
  if (!validStatuses.includes(status)) return res.redirect('/admin/licenses');

  try {
    await pool.query('UPDATE licenses SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.redirect(`/admin/license/${req.params.id}`);
  } catch (err) {
    console.error('Status update error:', err);
    res.redirect('/admin/licenses');
  }
});

router.post('/license/:id/notes', adminAuth, async (req, res) => {
  const { notes } = req.body;
  try {
    await pool.query('UPDATE licenses SET notes = $1 WHERE id = $2', [notes || '', req.params.id]);
    res.redirect(`/admin/license/${req.params.id}`);
  } catch (err) {
    console.error('Notes update error:', err);
    res.redirect('/admin/licenses');
  }
});

router.post('/license/:id/delete', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM licenses WHERE id = $1', [req.params.id]);
    res.redirect('/admin/licenses');
  } catch (err) {
    console.error('Delete error:', err);
    res.redirect('/admin/licenses');
  }
});

module.exports = router;
