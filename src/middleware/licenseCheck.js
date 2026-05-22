const pool = require('../db');

async function licenseCheck(req, res, next) {
  if (!req.session || !req.session.licenseId) {
    return res.redirect('/login');
  }

  try {
    const result = await pool.query(
      'SELECT * FROM licenses WHERE id = $1 AND status = $2',
      [req.session.licenseId, 'active']
    );

    if (result.rows.length === 0) {
      req.session.destroy();
      return res.redirect('/login?err=revoked');
    }

    const license = result.rows[0];

    if (req.session.hardwareId && license.hardware_id !== req.session.hardwareId) {
      req.session.destroy();
      return res.redirect('/login?err=device');
    }

    req.license = license;
    next();
  } catch (err) {
    console.error('licenseCheck error:', err);
    res.status(500).send('Server error');
  }
}

module.exports = licenseCheck;
