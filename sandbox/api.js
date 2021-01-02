const express = require('express');
const {handleClientResponse, extractItems} = require("./Tools");

const apiRouter = express.Router();

const {
  sortKeyIndex,
  tableName,
  dynamodb,
  schema: {
    sortKey,
    timeStampAttribute,
  }
} = require('./Config')

apiRouter.get(
  `/:asset_type`,
  (req, res) => {
    const {asset_type} = req.params
    const {changedSince} = req.query
    const changedSinceDate = changedSince ? parseInt(changedSince) : undefined

    const queryParams = {
      TableName: tableName,
      IndexName: sortKeyIndex,
      ExpressionAttributeValues: {
        ':t': asset_type,
        ...(changedSince ? {':d': changedSinceDate} : {})
      },
      KeyConditionExpression: `${sortKey} = :t${
        changedSince ? ` and ${timeStampAttribute} >= :d` : ''
      }`
    };

    dynamodb.query(queryParams, handleClientResponse(
      res,
      data =>
        extractItems(data)
          .filter(item => changedSince || !item.del)
    ));
  });


module.exports = apiRouter
