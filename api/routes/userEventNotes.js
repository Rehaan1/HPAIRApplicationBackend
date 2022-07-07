const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const admin = require('../../firebase/fb')
const multer = require('multer')
const path = require('path')
const upload = multer({ storage: multer.memoryStorage() })
const saltedMd5 = require('salted-md5')
const uuid4 = require('uuid4')

// Initializing Firestore DB
const db = admin.firestore()

// Initializing Firebase Storage Bucket
const bucket = admin.storage().bucket()

const userEventNotesRef = db.collection(process.env.FIREBASE_USER_EVENT_NOTES_COLLECTION)

// req.user._id
router.post('/create', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.body.eventId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.note) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.file) {
    userEventNotesRef.add({
      eventId: req.body.eventId,
      note: req.body.note,
      userId: req.user._id
    })
      .then((data) => {
        return res.status(200).json({
          status: '200',
          message: 'User Event Note Created Successfully',
          noteId: data.id
        })
      })
      .catch((error) => {
        console.log(error)
        return res.status(400).json({
          success: false,
          err: error
        })
      })
  } else {
    let name = saltedMd5(req.file.originalname, process.env.SALT)
    name = name + uuid4()
    const fileName = name + path.extname(req.file.originalname)

    await bucket.file(fileName)
      .createWriteStream()
      .end(req.file.buffer)
      .on('finish', (data) => {
        const imageUrl = process.env.BASE_URL + fileName

        userEventNotesRef.add({
          eventId: req.body.eventId,
          note: req.body.note,
          userId: req.user._id,
          imageUrl: imageUrl
        })
          .then((data) => {
            return res.status(200).json({
              status: '200',
              message: 'User Event Note Created Successfully',
              noteId: data.id
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
      .on('error', (err) => {
        console.log(err)
        return res.status(400).json({
          status: 400,
          val: err
        })
      })
  }
})

module.exports = router
