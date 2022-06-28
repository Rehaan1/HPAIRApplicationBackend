const admin = require('firebase-admin')

// Initializing Firebase Admin
module.exports =  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  })