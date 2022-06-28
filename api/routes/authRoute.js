const router = require('express').Router()
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')

// Initializing Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
})

// Initializing Firestore DB
const db = getFirestore()

router.post('/login', (req, res) => {
  // IDToken to be sent from Firebase Client on the Frontend
  if (!req.body.idToken) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  admin
    .auth()
    .verifyIdToken(req.body.idToken.toString())
    .then((decodedToken) => {
      // Creating JWT Auth Token
      const token = jwt.sign({ _id: decodedToken.user_id, email: decodedToken.email }, process.env.TOKEN_SECRET, { expiresIn: '730h' })
      // Accessing collection to get users document
      db.collection(process.env.FIREBASE_APPLICANT_COLLECTION)
        .doc(decodedToken.user_id)
        .get()
        .then((userData) => {
          if (!userData.exists) {
            return res.status(200).json({
              message: 'logged in',
              authToken: token,
              data: 'No User Data Found'
            })
          }
          return res.status(200).json({
            message: 'logged in',
            authToken: token,
            data: userData.data()
          })
        })
        .catch((error) => {
          console.log(error)
          return res.status(400).json({
            success: false,
            err: error
          })
        })
    })
    .catch((error) => {
      console.log(error)
      return res.status(400).json({
        success: false,
        err: error
      })
    })
})

module.exports = router
