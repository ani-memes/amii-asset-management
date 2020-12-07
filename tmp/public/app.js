const AWS = require('aws-sdk')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "amiiassets";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const partitionKeyName = "partition_key";
const sortKeyName = "sort_key";
// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

/********************************
 * HTTP Get method for list objects *
 ********************************/

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
      KeyConditionExpression: 'asset_type = :t'
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

app.listen(3000, function () {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
