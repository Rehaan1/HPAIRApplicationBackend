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

const eventsRef = db.collection(process.env.FIREBASE_EVENT_COLLECTION)

const cpUpload = upload.fields([{ name: 'event' }, { name: 'sponsor' }])
router.post('/create', verifyToken, cpUpload, async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.aboutEvent) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.aboutSpeaker) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.time) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.date) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.featured) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.files) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  let eventName = saltedMd5(req.files.event[0].originalname, process.env.SALT)
  eventName = eventName + uuid4()
  const eventFileName = eventName + path.extname(req.files.event[0].originalname)

  await bucket.file(eventFileName)
    .createWriteStream()
    .end(req.files.event[0].buffer)
    .on('finish', async (data) => {
      const eventImageUrl = process.env.BASE_URL + eventFileName

      if (req.files.sponsor) {
        let sponsorName = saltedMd5(req.files.sponsor[0].originalname, process.env.SALT)
        sponsorName = sponsorName + uuid4()
        const sponsorFileName = sponsorName + path.extname(req.files.sponsor[0].originalname)
        await bucket.file(sponsorFileName)
          .createWriteStream()
          .end(req.files.sponsor[0].buffer)
          .on('finish', (data) => {
            const sponsorImageUrl = process.env.BASE_URL + sponsorFileName
            if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
            eventsRef.add({
              title: req.body.title,
              aboutEvent: req.body.aboutEvent,
              aboutSpeaker: req.body.aboutSpeaker,
              time: req.body.time,
              date: req.body.date,
              featured: req.body.featured,
              eventImageUrl: eventImageUrl,
              sponsorDetails: req.body.sponsorDetails,
              sponsorImageUrl: sponsorImageUrl
            })
              .then((data) => {
                return res.status(200).json({
                  status: '200',
                  message: 'Event Created Successfully',
                  eventId: data.id
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
        if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
        eventsRef.add({
          title: req.body.title,
          aboutEvent: req.body.aboutEvent,
          aboutSpeaker: req.body.aboutSpeaker,
          time: req.body.time,
          date: req.body.date,
          featured: req.body.featured,
          sponsorDetails: req.body.sponsorDetails,
          eventImageUrl: eventImageUrl
        })
          .then((data) => {
            return res.status(200).json({
              status: '200',
              message: 'Event Created Successfully',
              eventId: data.id
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
    .on('error', (err) => {
      console.log(err)
      return res.status(400).json({
        status: 400,
        val: err
      })
    })
})

router.patch('/update', verifyToken, cpUpload, async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.aboutEvent) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.aboutSpeaker) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.time) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.date) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.featured) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.files) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.body.docId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (!req.files.event && !req.files.sponsor) {
    if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
    eventsRef.doc(req.body.docId).update({
      title: req.body.title,
      aboutEvent: req.body.aboutEvent,
      aboutSpeaker: req.body.aboutSpeaker,
      time: req.body.time,
      date: req.body.date,
      featured: req.body.featured,
      sponsorDetails: req.body.sponsorDetails
    })
      .then((data) => {
        return res.status(200).json({
          status: '200',
          message: 'Event Updated Successfully',
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
  } else if (req.files.event) {
    let eventName = saltedMd5(req.files.event[0].originalname, process.env.SALT)
    eventName = eventName + uuid4()
    const eventFileName = eventName + path.extname(req.files.event[0].originalname)

    await bucket.file(eventFileName)
      .createWriteStream()
      .end(req.files.event[0].buffer)
      .on('finish', async (data) => {
        const eventImageUrl = process.env.BASE_URL + eventFileName

        if (req.files.sponsor) {
          let sponsorName = saltedMd5(req.files.sponsor[0].originalname, process.env.SALT)
          sponsorName = sponsorName + uuid4()
          const sponsorFileName = sponsorName + path.extname(req.files.sponsor[0].originalname)
          await bucket.file(sponsorFileName)
            .createWriteStream()
            .end(req.files.sponsor[0].buffer)
            .on('finish', (data) => {
              const sponsorImageUrl = process.env.BASE_URL + sponsorFileName
              if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
              eventsRef.doc(req.body.docId).update({
                title: req.body.title,
                aboutEvent: req.body.aboutEvent,
                aboutSpeaker: req.body.aboutSpeaker,
                time: req.body.time,
                date: req.body.date,
                featured: req.body.featured,
                eventImageUrl: eventImageUrl,
                sponsorDetails: req.body.sponsorDetails,
                sponsorImageUrl: sponsorImageUrl
              })
                .then((data) => {
                  return res.status(200).json({
                    status: '200',
                    message: 'Event Updated Successfully',
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
        } else {
          if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
          eventsRef.doc(req.body.docId).update({
            title: req.body.title,
            aboutEvent: req.body.aboutEvent,
            aboutSpeaker: req.body.aboutSpeaker,
            time: req.body.time,
            date: req.body.date,
            featured: req.body.featured,
            sponsorDetails: req.body.sponsorDetails,
            eventImageUrl: eventImageUrl
          })
            .then((data) => {
              return res.status(200).json({
                status: '200',
                message: 'Event Updated Successfully',
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
        }
      })
      .on('error', (err) => {
        console.log(err)
        return res.status(400).json({
          status: 400,
          val: err
        })
      })
  } else if (req.files.sponsor) {
    let sponsorName = saltedMd5(req.files.sponsor[0].originalname, process.env.SALT)
    sponsorName = sponsorName + uuid4()
    const sponsorFileName = sponsorName + path.extname(req.files.sponsor[0].originalname)
    await bucket.file(sponsorFileName)
      .createWriteStream()
      .end(req.files.sponsor[0].buffer)
      .on('finish', (data) => {
        const sponsorImageUrl = process.env.BASE_URL + sponsorFileName
        if (!req.body.sponsorDetails) { req.body.sponsorDetails = '' }
        eventsRef.doc(req.body.docId).update({
          title: req.body.title,
          aboutEvent: req.body.aboutEvent,
          aboutSpeaker: req.body.aboutSpeaker,
          time: req.body.time,
          date: req.body.date,
          featured: req.body.featured,
          sponsorDetails: req.body.sponsorDetails,
          sponsorImageUrl: sponsorImageUrl
        })
          .then((data) => {
            return res.status(200).json({
              status: '200',
              message: 'Event Updated Successfully',
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
  }
})

router.get('/', verifyToken, (req, res) => {
  if (!req.body.docId) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  eventsRef.doc(req.body.docId)
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

module.exports = router
