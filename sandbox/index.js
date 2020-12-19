const bodyParser = require('body-parser')
const express = require('express')

// declare a new express app
const app = express()
app.use(bodyParser.json())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
});

const jwtDecode = require('jwt-decode');
app.use((req, res, next) => {
  const header = req.header("Authorization");
  if(header && header.startsWith("Bearer ")) {
    const token = jwtDecode(header.substr("Bearer ".length))
    const groups = token['cognito:groups'];
    if(groups && groups.find && groups.find(group => group === 'Admins')) {
      next()
    } else {
      res.status(403)
      res.send()
    }
  } else if(req.method !== "OPTIONS") {
    res.status(401)
    res.send()
  } else {
    next()
  }
})

app.use('/public/assets', require('./api'))

app.use('/assets', require('./adminAPI'))

const port = 4000;
app.listen(port, function () {
  console.log(`App started ${port}`)
});

process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

