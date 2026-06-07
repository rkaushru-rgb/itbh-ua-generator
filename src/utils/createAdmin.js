{
  "name": "ua-generator",
  "version": "1.0.0",
  "description": "IT Tech Brothers Hub — User Agent Generator with License System",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "db:init": "node src/utils/dbInit.js",
    "admin:create": "node src/utils/createAdmin.js",
    "build": "node src/utils/createAdmin.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "connect-pg-simple": "^9.0.1",
    "dotenv": "^16.4.5",
    "ejs": "^3.1.10",
    "express": "^4.19.2",
    "express-fileupload": "^1.5.0",
    "express-session": "^1.18.0",
    "pg": "^8.12.0",
    "sharp": "^0.33.4"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
