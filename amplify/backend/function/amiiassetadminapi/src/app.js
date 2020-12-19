/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_AMIIASSETSTORAGE_ARN
	STORAGE_AMIIASSETSTORAGE_NAME
Amplify Params - DO NOT EDIT */const bodyParser = require('body-parser');
const express = require('express');

// declare a new express app
const app = express();
app.use(bodyParser.json());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

const jwtDecode = require('jwt-decode');
app.use((req, res, next) => {
  const header = req.header("Authorization");
  if (req.method === "GET" || req.method === "OPTIONS") {
    next();
  } else if (header && header.startsWith("Bearer ")) {
    const token = jwtDecode(header.substr("Bearer ".length))
    const groups = token['cognito:groups'];
    if (groups && groups.find && groups.find(group => group === 'Admins')) {
      next()
    } else {
      res.status(403)
      res.send()
    }
  } else {
    res.status(401)
    res.send()
  }
});

app.use('/assets', require('./adminAPI'))

const port = 3000;
app.listen(port, function () {
  console.log(`App started ${port}`);
});

module.exports = app
