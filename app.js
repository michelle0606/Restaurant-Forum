const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./models')

const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

app.listen(3000, () => {
  db.sequelize.sync()
  console.log(`Example app listening on port 3000!`)
})

require('./routes')(app, passport)
