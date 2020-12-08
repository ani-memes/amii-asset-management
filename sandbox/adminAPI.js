const express = require('express');

const adminAPI = express.Router();

const {
  tableName,
  dynamodb,
  schema: {
    definitionAttribute,
    timeStampAttribute,
    sortKey,
    partitionKey,
  }
} = require('./AWSConfigs');
const omit = require('lodash/omit')

adminAPI.post(
  `/:asset_type`,
  (req, res) => {
    const {asset_type} = req.params
    const newAssets = req.body

    const uploadTime = Math.round(new Date().valueOf() / 1000);
    const batchWrite = {
      RequestItems: {
        [tableName]: newAssets.map(asset => ({
          PutRequest: {
            Item: {
              [partitionKey]: asset.id,
              [sortKey]: asset_type,
              [definitionAttribute]: JSON.stringify(omit(asset, ['id'])),
              [timeStampAttribute]: uploadTime,
            }
          }
        }))
      }
    };

    dynamodb.batchWrite(batchWrite, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({error: `Could not load items: ${err}`});
      } else {
        res.json(data.Items);
      }
    });
  });


module.exports = adminAPI

module.exports
