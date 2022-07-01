const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const admin = require('../../firebase/fb')

// Initializing Firestore DB
const db = admin.firestore()

const friendsRef = db.collection(process.env.FIREBASE_FRIEND_COLLECTION)

router.post('/sendRequest', verifyToken, (req, res) => {
  // check if uid of individual sent for request
  if (!req.body.fuid) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  const uid = req.user._id

  friendsRef.doc(req.body.fuid)
    .get()
    .then((docu) => {
      // If Individuals Document does Not Exist
      if (!docu.exists) {
        const statusObj = {}
        statusObj[uid] = 0
        // create individuals document
        friendsRef.doc(req.body.fuid)
          .set({
            // add the users request as pending
            status: statusObj
          })
          .then((data) => {
            // Check Users Document
            friendsRef.doc(uid)
              .get()
              .then((docu) => {
                // if users document does not exist
                if (!docu.exists) {
                  const statusObj = {}
                  statusObj[req.body.fuid] = 0
                  // create users document
                  friendsRef.doc(uid)
                    .set({
                      // add individuals request as pending
                      status: statusObj
                    })
                    .then((data) => {
                      return res.status(200).json({
                        success: true,
                        message: 'Friend Request Sent'
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
                // If Users Document Exists
                  const statusObj = docu.data().status
                  // If Already Request Sent Before
                  if (req.body.fuid in statusObj) {
                    return res.status(200).json({
                      success: false,
                      message: 'Friend Request Already Pending'
                    })
                  } else {
                    statusObj[req.body.fuid] = 0
                    // Update Users Document
                    friendsRef.doc(uid)
                      .update({
                        status: statusObj
                      })
                      .then((data) => {
                        return res.status(200).json({
                          success: true,
                          message: 'Friend Request Sent'
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
                }
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
      } else {
        // If Document Exists of Individual

        // Get Friend Status of Individual
        const statusObj = docu.data().status

        // If Already Request Sent Before
        if (uid in statusObj) {
          return res.status(200).json({
            success: false,
            message: 'Friend Request Already Pending'
          })
        } else {
          statusObj[uid] = 0
          friendsRef.doc(req.body.fuid)
            .update({
              status: statusObj
            })
            .then((data) => {
            // Check Users Document
              friendsRef.doc(uid)
                .get()
                .then((docu) => {
                // if users document does not exist
                  if (!docu.exists) {
                    const statusObj = {}
                    statusObj[req.body.fuid] = 0
                    // create users document
                    friendsRef.doc(uid)
                      .set({
                      // add individuals request as pending
                        status: statusObj
                      })
                      .then((data) => {
                        return res.status(200).json({
                          success: true,
                          message: 'Friend Request Sent'
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

                  // If Users Document Exists
                  const statusObj = docu.data().status
                  // If Already Request Sent Before
                  if (req.body.fuid in statusObj) {
                    return res.status(200).json({
                      success: false,
                      message: 'Friend Request Already Pending'
                    })
                  } else {
                    statusObj[req.body.fuid] = 0
                    // Update Users Document
                    friendsRef.doc(uid)
                      .update({
                        status: statusObj
                      })
                      .then((data) => {
                        return res.status(200).json({
                          success: true,
                          message: 'Friend Request Sent'
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
        }
      }
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
