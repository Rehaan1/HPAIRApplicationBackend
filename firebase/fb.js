const admin = require('firebase-admin')

// Initializing Firebase Admin
module.exports = admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii')))
})
