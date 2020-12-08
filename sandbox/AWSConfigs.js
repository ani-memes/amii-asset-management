const AWS = require('aws-sdk');

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566',
});

const tableName = "AMIIAssets";

const assetTypeIndex = 'sort_key_index';

const timeStampAttribute = 'ts';
const partitionKey = 'pk';
const sortKey = 'sk';
const definitionAttribute = 'def';

module.exports = {
  dynamodb,
  tableName,
  assetTypeIndex,
  schema: {
    partitionKey,
    sortKey,
    timeStampAttribute,
    definitionAttribute
  },
};
