require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const fileUpload = require('express-fileupload');
const path = require('path');
const pool = require('./db');

const authRouter = require('./routes/auth');
const generatorRouter = require('./routes/generator');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true }));

app.use(session({
  store: new pgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'itbh_fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/uploads', (req, res, next) => {
  if (!req.session || (!req.session.licenseId && !req.session.adminId)) {
    return res.status(403).send('Forbidden');
  }
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.use('/', authRouter);
app.use('/', generatorRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: '404 — IT Tech Brothers Hub' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`IT Tech Brothers Hub UA Generator running on port ${PORT}`);
});
