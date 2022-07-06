const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const admin = require('../../firebase/fb')

// Initializing Firestore DB
const db = admin.firestore()

const articlesRef = db.collection(process.env.FIREBASE_ARTICLE_COLLECTION)

router.get('/',verifyToken,(req,res)=>{
    res.status(200).json({
        status: "Up and Running Article Route"
    })
})

module.exports = router