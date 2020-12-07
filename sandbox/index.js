const AWS = require('aws-sdk')
const bodyParser = require('body-parser')
const express = require('express')

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566',
});

let tableName = "AMIIAssets";

// declare a new express app
const app = express()
app.use(bodyParser.json())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


const assetRouter = express.Router();

const assetTypeIndex = 'asset_type_index';

assetRouter.get(
  `/:asset_type`,
  (req, res) => {
    const {asset_type} = req.params

    const queryParams = {
      TableName: tableName,
      IndexName: assetTypeIndex,
      ExpressionAttributeValues: {
        ':t': asset_type,
      },
      KeyConditionExpression: 'ast = :t'
    };

    dynamodb.query(queryParams, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({error: 'Could not load items: ' + err});
      } else {
        res.json(data.Items);
      }
    });
  });

app.use('/public/assets', assetRouter)

const port = 4000;
app.listen(port, function () {
  console.log(`App started ${port}`)
});
