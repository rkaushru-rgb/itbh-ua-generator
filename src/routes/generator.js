const express = require('express');
const router = express.Router();
const pool = require('../db');
const licenseCheck = require('../middleware/licenseCheck');
const { generateBatch, UA_DATA, BROWSER_DATA } = require('../utils/uaGenerator');

router.get('/', licenseCheck, async (req, res) => {
  const stats = await pool.query(`
    SELECT
      COUNT(*) AS total_generated,
      COUNT(DISTINCT os_name) AS unique_os,
      COUNT(DISTINCT browser_name) AS unique_browsers,
      COUNT(DISTINCT license_id) AS active_users
    FROM generated_user_agents
  `);
  const s = stats.rows[0];
  res.render('generator', {
    title: 'User Agent Generator — IT Tech Brothers Hub',
    license: req.license,
    UA_DATA,
    BROWSER_DATA,
    stats: s
  });
});

router.post('/generate', licenseCheck, async (req, res) => {
  try {
    const { device, os, osVersion, browser, batchSize } = req.body;

    const validDevices = ['desktop', 'mobile', 'tablet', 'smarttv'];
    const validOS = Object.keys(UA_DATA);
    const validBrowsers = Object.keys(BROWSER_DATA);

    if (!validDevices.includes(device)) return res.json({ ok: false, msg: 'Invalid device.' });

    const selectedOS = Array.isArray(os) ? os : [os];
    const selectedBrowsers = Array.isArray(browser) ? browser : [browser];

    if (!selectedOS.every(o => validOS.includes(o))) return res.json({ ok: false, msg: 'Invalid OS.' });
    if (!selectedBrowsers.every(b => validBrowsers.includes(b))) return res.json({ ok: false, msg: 'Invalid browser.' });

    const batch = Math.min(Math.max(parseInt(batchSize) || 1, 1), 500);

    const existingHashes = await pool.query('SELECT ua_hash FROM generated_user_agents');
    const hashSet = new Set(existingHashes.rows.map(r => r.ua_hash));

    const results = [];
    const perCombo = Math.ceil(batch / (selectedOS.length * selectedBrowsers.length));

    for (const osKey of selectedOS) {
      for (const browserKey of selectedBrowsers) {
        const combo = generateBatch(
          { device, osKey, osVersion: osVersion || null, browserKey, browserVersion: null },
          perCombo,
          hashSet
        );
        for (const ua of combo) {
          if (results.length >= batch) break;
          hashSet.add(ua.ua_hash);
          results.push(ua);
        }
        if (results.length >= batch) break;
      }
    }

    if (results.length === 0) {
      return res.json({ ok: false, msg: 'Could not generate unique user agents. The pool for this combination may be exhausted. Try different settings.' });
    }

    const insertPromises = results.map(ua =>
      pool.query(
        `INSERT INTO generated_user_agents (ua_hash, ua_string, device_type, os_name, os_version, browser_name, browser_version, license_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (ua_hash) DO NOTHING`,
        [ua.ua_hash, ua.ua_string, ua.device_type, ua.os_name, ua.os_version, ua.browser_name, ua.browser_version, req.license.id]
      )
    );
    await Promise.all(insertPromises);

    res.json({ ok: true, count: results.length, agents: results.map(u => u.ua_string) });
  } catch (err) {
    console.error('Generate error:', err);
    res.json({ ok: false, msg: 'Server error. Please try again.' });
  }
});

module.exports = router;
