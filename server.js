'use strict'
require('dotenv').config()

var express = require('express')
const app = express()
const helmet = require('helmet')
const sessions = require('client-sessions')
app.use(helmet())
var bodyParser = require('body-parser')
var cors = require('cors')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const User = require('./models/user.js')

var apiRoutes = require('./routes/api.js')
var authRoutes = require('./routes/auth.js')

var fccTestingRoutes = require('./routes/fcctesting.js')
var runner = require('./test-runner')

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
    .then(data =>
      res.render('index', { user: data.username })
    )
    .catch(err => res.render('login'))
})

// For FCC testing purposes
fccTestingRoutes(app)

// Routing for API

authRoutes(app)
apiRoutes(app)

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found')
})

// Start our server and tests!

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
        var error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 3500)
  }
})

module.exports = app // for testing
