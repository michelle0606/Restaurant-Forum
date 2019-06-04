const express = require('express')
const app = express()
const db = require('./models')

app.set('view engine', 'pug')

app.listen(3000, () => {
  db.sequelize.sync()
  console.log(`Example app listening on port 3000!`)
})

require('./routes')(app)
