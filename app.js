const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const port = process.env.PORT || 3000
const app = express()
const db = require('./models')

const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))
app.engine(
  'handlebars',
  handlebars({
    defaultLayout: 'main',
    helpers: require('./config/handlebars-helpers')
  })
)
app.set('view engine', 'handlebars')
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.currentUser = req.user
  next()
})

app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Example app listening on port 3000!`)
})

require('./routes')(app)
