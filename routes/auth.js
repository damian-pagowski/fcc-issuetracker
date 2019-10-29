const User = require('../models/user.js')
const bcrypt = require('bcrypt')
module.exports = function (app) {
  app.get('/logout', function (req, res, next) {
    req.session.reset()
    res.redirect('/login')
  })
  app
    .route('/login/')
    .get((req, res) => {
      res.render('login', { error: null })
    })
    .post((req, res) => {
      // const data = { ...req.body }
      User.findOne({ username: req.body.username }).then(user => {
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
          req.session.userId = user._id
          res.redirect('/')
        } else {
          res.render('login', { error: 'Invalid password!' })
        }
      })
    })
  app
    .route('/register/')
    .get((req, res) => {
      res.render('register', { error: null })
    })
    .post((req, res) => {
      const data = { ...req.body }
      User.find({ username: data.username }).then(user => {
        if (user.length > 0) {
          res.render('register', { error: 'User already exist!' })
        } else {
          if (data.password !== data.passwordRepeated) {
            res.render('register', { error: 'Passwords does not match!' })
          } else {
            const hash = bcrypt.hashSync(data.password, 14)
            data.password = hash
            const user = new User(data)
            user
              .save()
              .then(() => {
                req.session.userId = user._id
                res.redirect('/')
              })
              .catch(err =>
                res.render('register', { error: JSON.stringify(err) })
              )
          }
        }
      })
    })
}
