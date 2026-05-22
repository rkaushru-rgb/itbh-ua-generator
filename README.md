# IT Tech Brothers Hub — User Agent Generator

A fully licensed, server-side rendered user agent generator with admin panel, hardware-locked license keys, and a duplicate-prevention system.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secret
```

Your `.env` must contain:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ua_generator
SESSION_SECRET=your_long_random_secret_here
PORT=3000
```

### 3. Create the Database

Create a PostgreSQL database named `ua_generator` (or whatever you set in `DATABASE_URL`), then run:

```bash
npm run db:init
```

### 4. Create an Admin Account

```bash
npm run admin:create
# Follow the prompts to set username and password
```

### 5. Start the Server

```bash
npm start
```

Visit `http://localhost:3000` to access the user agent generator.
Visit `http://localhost:3000/admin` to access the admin panel.

---

## License Key System

### Format
```
ITBH-XXXXX-XX-DD-MM-YY
```
Example: `ITBH-A3K9M-XZ-21-05-26`

### How It Works

1. A user visits `/register` and fills in:
   - Full name
   - Valid email address
   - Valid contact number
   - Profile picture (JPG/PNG/WEBP)
   - Hardware ID (auto-generated from their browser fingerprint)

2. The system checks for duplicate email, contact number, or hardware ID — if any match exists, registration is rejected.

3. A unique license key is generated and shown **once only**. The user must save it.

4. The license is bound to the user's specific browser/device hardware fingerprint. It cannot be used on any other device.

5. Users log in at `/login` with their license key. Their hardware ID is verified on every login.

---

## Admin Panel

Access at `/admin/login`.

- **Dashboard** — overview stats (total/active/revoked licenses, UAs generated)
- **Licenses** — searchable, filterable list of all licenses with holder details
- **License Detail** — full profile: name, email, contact, picture, hardware ID, last login device, generated UA history
- **Actions** — activate, revoke, or permanently delete a license
- **Notes** — add internal notes to any license

---

## User Agent Generator Features

- **No auto-selection** — users manually pick devices, OS, and browsers
- **Multiple selection** — any combination of devices, OS, and browsers
- **Customizable OS version** — enter any version string or leave blank for random
- **Customizable batch size** — 1 to 500 user agents per generation
- **TikTok In-App Browser** included as a browser option
- **Unique only** — each generated UA is stored in the database; the same UA will never be generated twice on this server
- **Unlimited generation** — no caps on the number of UAs

### Supported Devices
- Desktop, Mobile, Tablet, Smart TV

### Supported OS
- Windows, macOS, Linux, Android, iOS/iPadOS, ChromeOS

### Supported Browsers
- Chrome, Firefox, Safari, Edge, Opera, Samsung Browser, TikTok In-App

---

## Security

- All pages are server-side rendered with EJS — no client-side source exposure
- Sessions are stored in PostgreSQL (not in-memory)
- License access is tied to a cryptographic browser fingerprint (SHA-256 of canvas, WebGL, screen, platform, language, timezone)
- Uploaded pictures are only accessible to authenticated users
- All security headers set (X-Frame-Options, X-Content-Type-Options, etc.)
- Admin and user sessions are completely separate

---

## Production Deployment

For production, set in `.env`:
```
NODE_ENV=production
```

This enables:
- Secure cookies (HTTPS only)
- SSL database connections

Use a reverse proxy (nginx/Caddy) with HTTPS in front of the Node.js server.

---

## File Structure

```
ua-generator/
├── src/
│   ├── index.js           Express server entry
│   ├── db.js              PostgreSQL connection pool
│   ├── routes/
│   │   ├── auth.js        Login, logout, register
│   │   ├── generator.js   UA generation endpoint
│   │   └── admin.js       Admin panel routes
│   ├── middleware/
│   │   ├── licenseCheck.js  Validates active license + hardware ID
│   │   └── adminAuth.js     Admin session check
│   └── utils/
│       ├── licenseGen.js    License key generator (ITBH-XXXXX-XX-DD-MM-YY)
│       ├── uaGenerator.js   User agent generation logic
│       ├── dbInit.js        Database schema initialization
│       └── createAdmin.js   CLI tool to create admin users
├── views/
│   ├── login.ejs           License login page
│   ├── register.ejs        License application page
│   ├── generator.ejs       Main UA generator interface
│   ├── 404.ejs             404 page
│   └── admin/
│       ├── login.ejs       Admin login
│       ├── dashboard.ejs   Admin dashboard
│       ├── licenses.ejs    License list
│       └── license-detail.ejs  License detail + actions
├── schema/
│   └── init.sql            PostgreSQL schema
├── uploads/                License holder profile pictures
├── package.json
├── .env.example
└── README.md
```

---

## Support

IT Tech Brothers Hub — All Rights Reserved.
