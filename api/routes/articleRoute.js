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

const articlesRef = db.collection(process.env.FIREBASE_ARTICLE_COLLECTION)

router.post('/create', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.content) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.featured) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  let name = saltedMd5(req.file.originalname, process.env.SALT)
  name = name + uuid4()
  const fileName = name + path.extname(req.file.originalname)

  await bucket.file(fileName)
    .createWriteStream()
    .end(req.file.buffer)
    .on('finish', (data) => {
      const imageUrl = process.env.BASE_URL + fileName

      articlesRef.add({
        title: req.body.title,
        content: req.body.content,
        featured: req.body.featured,
        imageUrl: imageUrl
      })
        .then((data) => {
          return res.status(200).json({
            status: '200',
            message: 'Article Created Successfully',
            articleId: data.id
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
})

router.patch('/update', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.docId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.content) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.featured) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (req.file) {
    let name = saltedMd5(req.file.originalname, process.env.SALT)
    name = name + uuid4()
    const fileName = name + path.extname(req.file.originalname)

    await bucket.file(fileName)
      .createWriteStream()
      .end(req.file.buffer)
      .on('finish', (data) => {
        const imageUrl = process.env.BASE_URL + fileName

        articlesRef.doc(req.body.docId).update({
          title: req.body.title,
          content: req.body.content,
          featured: req.body.featured,
          imageUrl: imageUrl
        })
          .then((data) => {
            return res.status(200).json({
              status: '200',
              message: 'Article Created Successfully',
              data: data
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
  } else {
    articlesRef.doc(req.body.docId).update({
      title: req.body.title,
      content: req.body.content,
      featured: req.body.featured
    })
      .then((data) => {
        return res.status(200).json({
          status: '200',
          message: 'Article Updated Successfully',
          data: data
        })
      })
      .catch((error) => {
        console.log(error)
        return res.status(400).json({
          success: false,
          err: error
        })
      })
  }
})

router.get('/', verifyToken, (req, res) => {
  if (!req.body.docId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  articlesRef.doc(req.body.docId)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(400).json({
          status: 400,
          message: 'doc does not exist'
        })
      }
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: docu.data()
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

router.get('/getAll', verifyToken, (req, res) => {
  articlesRef.get()
    .then((data) => {
      const articles = {}

      data.forEach((doc) => {
        articles[doc.id] = {
          title: doc.data().title,
          imageUrl: doc.data().imageUrl
        }
      })

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: articles
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

router.get('/getFeatured', verifyToken, (req, res) => {
  articlesRef.where('featured', '==', '1')
    .get()
    .then((data) => {
      const articles = {}

      data.forEach((doc) => {
        articles[doc.id] = {
          title: doc.data().title,
          imageUrl: doc.data().imageUrl
        }
      })

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: articles
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

router.delete('/delete', verifyToken, (req, res) => {
  if (!req.body.docId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  articlesRef.doc(req.body.docId)
    .delete()
    .then((data) => {
      return res.status(200).json({
        status: 200,
        message: 'deleted successfully'
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
