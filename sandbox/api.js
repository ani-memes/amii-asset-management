const AWS = require('aws-sdk');
const express = require('express');

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566',
});

const tableName = "AMIIAssets";

const apiRouter = express.Router();

const assetTypeIndex = 'asset_type_index';

apiRouter.get(
  `/:asset_type`,
  (req, res) => {
    const {asset_type} = req.params
    const {changedSince} = req.query
    const changedSinceDate = changedSince ? parseInt(changedSince) : undefined

    const queryParams = {
      TableName: tableName,
      IndexName: assetTypeIndex,
      ExpressionAttributeValues: {
        ':t': asset_type,
        ...(changedSince ? {':d': changedSinceDate} : {})
      },
      KeyConditionExpression: `ast = :t${changedSince ? ' and ts >= :d' : ''}`
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


module.exports = apiRouter

module.exports
