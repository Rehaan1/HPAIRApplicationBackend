const router = require('express').Router()
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

admin.initializeApp({
    credential: admin.credential.applicationDefault()
})

const db = getFirestore();

router.post('/login',(req,res) => {
    res.status(200).json({
        status: 200,
        message: "login service up and running"
    })
})


module.exports = router