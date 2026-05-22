-- UA Generator — IT Tech Brothers Hub
-- Run once on fresh database: node src/utils/dbInit.js

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(40) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  contact VARCHAR(60) UNIQUE NOT NULL,
  picture_path VARCHAR(600),
  hardware_id VARCHAR(512) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  last_device VARCHAR(1000),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS generated_user_agents (
  id SERIAL PRIMARY KEY,
  ua_hash VARCHAR(64) UNIQUE NOT NULL,
  ua_string TEXT NOT NULL,
  device_type VARCHAR(60),
  os_name VARCHAR(120),
  os_version VARCHAR(60),
  browser_name VARCHAR(120),
  browser_version VARCHAR(60),
  license_id INTEGER REFERENCES licenses(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ua_hash ON generated_user_agents(ua_hash);
CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_license_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_license_contact ON licenses(contact);
CREATE INDEX IF NOT EXISTS idx_license_hardware ON licenses(hardware_id);
