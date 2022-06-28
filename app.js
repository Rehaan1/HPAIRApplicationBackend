require('dotenv').config()

const express = require('express')
const cors = require('cors')
const authRoute = require('./api/routes/authRoute')
const profileRoute = require('./api/routes/profileRoute')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors())

app.use('/auth', authRoute)
app.use('/profile', profileRoute)

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'HPAIR Application Backend Up and Running. Refer Documentation'
  })
})

app.listen(process.env.PORT, () => {
  console.log('Listening on Port ' + process.env.PORT)
})
