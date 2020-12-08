const express = require('express');

const apiRouter = express.Router();

const {
  assetTypeIndex,
  tableName,
  dynamodb,
  assetTypeAttribute,
  timeStampAttribute,
} = require('./AWSConfigs')

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
      KeyConditionExpression: `${assetTypeAttribute} = :t${
        changedSince ? ` and ${timeStampAttribute} >= :d` : ''
      }`
    };

    dynamodb.query(queryParams, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({error: `Could not load items: ${err}`});
      } else {
        res.json(data.Items);
      }
    });
  });


module.exports = apiRouter

module.exports
