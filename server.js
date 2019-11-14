'use strict'
require('dotenv').config()
const BadRequestError = require('http-errors').BadRequestError
const path = require('path')
const rfs = require('rotating-file-stream')
const morgan = require('morgan')
const morganBody = require('morgan-body')

const express = require('express')
const app = express()
const helmet = require('helmet')
const sessions = require('client-sessions')
app.use(helmet())
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const User = require('./models/user.js')

const apiRoutes = require('./routes/api.js')
const authRoutes = require('./routes/auth.js')

const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner')
const compression = require('compression')

app.use(compression())

// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rolling log
  path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))
morganBody(app)

const port = process.env.PORT || 3000
app.use(
  sessions({
    cookieName: 'session',
    secret: process.env.SECRET,
    duration: 30 * 60 * 1000
  })
)
app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) // For FCC testing purposes only

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  if (!(req.session && req.session.userId)) {
    next()
  }
  User.findById(req.session.userId)
    .then(user => {
      if (!user) {
        next()
      } else {
        user.password = undefined
        req.user = user
        res.locals.user = user
        next()
      }
    })
    .catch(error => next(error))
})
// Sample front-end
app.route('/issues/:project/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/issue.html')
})
function loginRequired (req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  } else {
    next()
  }
}
// Index page (static HTML)
app.route('/').get(loginRequired, (req, res, next) => {
  if (!(req.session && req.session.userId)) {
    return res.redirect('/login')
  }
  User.findById(req.session.userId)
    .then(data => res.render('index', { user: data.username }))
    .catch(err => res.render('login'))
})

// For FCC testing purposes
fccTestingRoutes(app)

// Routing for API
app.use((err, req, res, next) => {
  handleError(err, res)
})

authRoutes(app)
apiRoutes(app)

app.use(function (err, req, res, next) {
  console.log('ERROR: ' + JSON.stringify(err))
  if (err == BadRequestError) {
    res.status(400)
    return res.send(err.message)
  } else {
    res.status(500)

    return res.send(err.message)
  }
})

const handleError = (err, res) => {
  const { statusCode, message } = err
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  })
}

const uri = process.env.MONGOLAB_URI
console.log(`Connecting to database:  ${uri}`)
mongoose.connect(uri)
app.listen(port, function () {
  console.log('Listening on port ' + port)
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (e) {
        const error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 3500)
  }
})

module.exports = app // for testing
