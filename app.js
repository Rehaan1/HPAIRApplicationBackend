require('dotenv').config()

const express = require('express')
const cors = require('cors')
const authRoute = require('./api/routes/authRoute')
const profileRoute = require('./api/routes/profileRoute')
const friendRequestRoute = require('./api/routes/friendRequestRoute')
const articleRoute = require('./api/routes/articleRoute')
const eventRoute = require('./api/routes/eventRoute')
const userEventNotes = require('./api/routes/userEventNotes')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors())

app.use('/auth', authRoute)
app.use('/profile', profileRoute)
app.use('/connect', friendRequestRoute)
app.use('/article', articleRoute)
app.use('/event', eventRoute)
app.use('/userEventNotes', userEventNotes)

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'HPAIR Application Backend Up and Running. Refer Documentation'
  })
})

app.listen(process.env.PORT, () => {
  console.log('Listening on Port ' + process.env.PORT)
})
