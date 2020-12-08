const bodyParser = require('body-parser')
const express = require('express')

// declare a new express app
const app = express()
app.use(bodyParser.json())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.use('/public/assets', require('./api'))

app.use('/assets', require('./adminAPI'))

const port = 4000;
app.listen(port, function () {
  console.log(`App started ${port}`)
});
