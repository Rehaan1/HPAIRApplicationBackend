const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const admin = require('../../firebase/fb')

// Initializing Firestore DB
const db = admin.firestore()

router.get('/userProfile',verifyToken, (req,res) =>{
    db.collection(process.env.FIREBASE_APPLICANT_COLLECTION)
    .doc(req.user._id)
    .get()
    .then((userData) =>{
        if (!userData.exists) {
            return res.status(200).json({
              data: 'No User Data Found'
            })
        }
        return res.status(200).json({
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

module.exports = router