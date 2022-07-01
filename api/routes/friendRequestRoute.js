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

  if (req.body.fuid === req.user._id) {
    return res.status(400).json({
      error: 'cannot send yourself connection request. To Connect with yourself, consider meditation ;)'
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
            incStatus: statusObj,
            outStatus: {}
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
                      outStatus: statusObj,
                      incStatus: {}
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
                  let statusObj = docu.data().outStatus
                  if (!statusObj) {
                    statusObj = {}
                  }
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
                        outStatus: statusObj
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
        let statusObj = docu.data().incStatus

        if (!statusObj) {
          statusObj = {}
        }

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
              incStatus: statusObj
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
                        outStatus: statusObj,
                        incStatus: {}
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
                    console.log(docu.data())
                    let statusObj = docu.data().outStatus
                    if (!statusObj) {
                      statusObj = {}
                    }
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
                          outStatus: statusObj
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

router.get('/getPending', verifyToken, (req, res) => {
  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: true,
          message: 'No Pending Requests'
        })
      }

      const statusObj = docu.data().incStatus

      const pendingReq = []

      for (const key in statusObj) {
        if (statusObj[key] === 0) {
          pendingReq.push(key)
        }
      }

      if (pendingReq.length <= 0) {
        return res.status(200).json({
          success: true,
          message: 'Pending User Data Empty'
        })
      }

      db.collection(process.env.FIREBASE_APPLICANT_COLLECTION)
        .where('__name__', 'in', pendingReq)
        .get()
        .then((docs) => {
          if (docs.empty) {
            return res.status(200).json({
              success: true,
              message: 'Pending User Data Document Empty'
            })
          }

          const list = {}
          docs.forEach(document => {
            list[document.id] = document.data()
          })
          return res.status(200).json({
            success: true,
            message: list
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

router.get('/getOutgoingPending', verifyToken, (req, res) => {
  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: true,
          message: 'No Pending Requests'
        })
      }

      const statusObj = docu.data().outStatus

      const pendingReq = []

      for (const key in statusObj) {
        if (statusObj[key] === 0) {
          pendingReq.push(key)
        }
      }

      if (pendingReq.length <= 0) {
        return res.status(200).json({
          success: true,
          message: 'Pending User Data Empty'
        })
      }

      db.collection(process.env.FIREBASE_APPLICANT_COLLECTION)
        .where('__name__', 'in', pendingReq)
        .get()
        .then((docs) => {
          if (docs.empty) {
            return res.status(200).json({
              success: true,
              message: 'Pending User Data Document Empty'
            })
          }

          const list = {}
          docs.forEach(document => {
            list[document.id] = document.data()
          })
          return res.status(200).json({
            success: true,
            message: list
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

router.post('/acceptRequest', verifyToken, (req, res) => {
  // check if uid of individual sent for request
  if (!req.body.fuid) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (req.body.fuid === req.user._id) {
    return res.status(400).json({
      error: 'cannot send yourself connection request. To Connect with yourself, consider meditation ;)'
    })
  }

  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: false,
          message: 'No Requests'
        })
      }

      // get users incoming request status
      const statusObj = docu.data().incStatus

      if (!(req.body.fuid in statusObj)) {
        return res.status(200).json({
          success: false,
          message: 'No Request of UID There to Acccept'
        })
      }

      // if already accepted stop
      if (statusObj[req.body.fuid] === 1) {
        return res.status(200).json({
          success: false,
          message: 'Already a connection'
        })
      }

      // Update status to accepted
      statusObj[req.body.fuid] = 1

      friendsRef.doc(req.user._id)
        .update({
          incStatus: statusObj
        })
        .then((data) => {
          // get individual's document
          friendsRef.doc(req.body.fuid)
            .get()
            .then((docu) => {
              if (!docu.exists) {
                return res.status(200).json({
                  success: false,
                  message: 'No Requests'
                })
              }

              // get users outgoing request status
              const statusObj = docu.data().outStatus

              if (!(req.user._id in statusObj)) {
                return res.status(200).json({
                  success: false,
                  message: 'Users Request Mismatch'
                })
              }
              // update status to accepted
              statusObj[req.user._id] = 1
              friendsRef.doc(req.body.fuid)
                .update({
                  outStatus: statusObj
                })
                .then((data) => {
                  return res.status(200).json({
                    success: true,
                    message: 'Request Accepted Successfully'
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

router.post('/rejectRequest', verifyToken, (req, res) => {
  // check if uid of individual sent for request
  if (!req.body.fuid) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (req.body.fuid === req.user._id) {
    return res.status(400).json({
      error: 'cannot send yourself connection request. To Connect with yourself, consider meditation ;)'
    })
  }

  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: false,
          message: 'No Requests'
        })
      }

      // get users incoming request status
      const statusObj = docu.data().incStatus

      if (!(req.body.fuid in statusObj)) {
        return res.status(200).json({
          success: false,
          message: 'No Request of UID There to Acccept'
        })
      }

      // if already accepted stop
      if (statusObj[req.body.fuid] === 2) {
        return res.status(200).json({
          success: false,
          message: 'Already a rejected connection'
        })
      }

      // Update status to accepted
      statusObj[req.body.fuid] = 2

      friendsRef.doc(req.user._id)
        .update({
          incStatus: statusObj
        })
        .then((data) => {
          // get individual's document
          friendsRef.doc(req.body.fuid)
            .get()
            .then((docu) => {
              if (!docu.exists) {
                return res.status(200).json({
                  success: false,
                  message: 'No Requests'
                })
              }

              // get users outgoing request status
              const statusObj = docu.data().outStatus

              if (!(req.user._id in statusObj)) {
                return res.status(200).json({
                  success: false,
                  message: 'Users Request Mismatch'
                })
              }
              // update status to accepted
              statusObj[req.user._id] = 2
              friendsRef.doc(req.body.fuid)
                .update({
                  outStatus: statusObj
                })
                .then((data) => {
                  return res.status(200).json({
                    success: true,
                    message: 'Request Rejected Successfully'
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

router.get('/getFriends', verifyToken, (req, res) => {
  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: true,
          message: 'No Friends'
        })
      }

      const incStatusObj = docu.data().incStatus
      const outStatusObj = docu.data().outStatus

      const friends = []

      for (const key in incStatusObj) {
        if (incStatusObj[key] === 1) {
          friends.push(key)
        }
      }
      for (const key in outStatusObj) {
        if (outStatusObj[key] === 1) {
          friends.push(key)
        }
      }

      if (friends.length <= 0) {
        return res.status(200).json({
          success: true,
          message: 'Friend Data Empty'
        })
      }

      db.collection(process.env.FIREBASE_APPLICANT_COLLECTION)
        .where('__name__', 'in', friends)
        .get()
        .then((docs) => {
          if (docs.empty) {
            return res.status(200).json({
              success: true,
              message: 'Friend Data Documents Empty'
            })
          }

          const list = {}
          docs.forEach(document => {
            list[document.id] = document.data()
          })
          return res.status(200).json({
            success: true,
            message: list
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

router.post('/removeFriend', verifyToken, (req, res) => {
  // check if uid of individual sent for request
  if (!req.body.fuid) {
    return res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  if (req.body.fuid === req.user._id) {
    return res.status(400).json({
      error: 'cannot send yourself connection request. To Connect with yourself, consider meditation ;)'
    })
  }

  friendsRef.doc(req.user._id)
    .get()
    .then((docu) => {
      if (!docu.exists) {
        return res.status(200).json({
          success: false,
          message: 'No Requests'
        })
      }

      // get users incoming request status
      const statusObj = docu.data().incStatus

      if (!(req.body.fuid in statusObj)) {
        return res.status(200).json({
          success: false,
          message: 'No Request of UID There to Acccept'
        })
      }

      // if already accepted stop
      if (statusObj[req.body.fuid] === -1) {
        return res.status(200).json({
          success: false,
          message: 'Already removed'
        })
      }

      // Update status to accepted
      statusObj[req.body.fuid] = -1

      friendsRef.doc(req.user._id)
        .update({
          incStatus: statusObj
        })
        .then((data) => {
          // get individual's document
          friendsRef.doc(req.body.fuid)
            .get()
            .then((docu) => {
              if (!docu.exists) {
                return res.status(200).json({
                  success: false,
                  message: 'No Requests'
                })
              }

              // get users outgoing request status
              const statusObj = docu.data().outStatus

              if (!(req.user._id in statusObj)) {
                return res.status(200).json({
                  success: false,
                  message: 'Users Request Mismatch'
                })
              }
              // update status to accepted
              statusObj[req.user._id] = -1
              friendsRef.doc(req.body.fuid)
                .update({
                  outStatus: statusObj
                })
                .then((data) => {
                  return res.status(200).json({
                    success: true,
                    message: 'Friend Removed Successfully'
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
