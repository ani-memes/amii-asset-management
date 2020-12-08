const AWS = require('aws-sdk');

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566',
});

const tableName = "AMIIAssets";

const sortKeyIndex = 'sort_key_index';

const timeStampAttribute = 'ts';
const partitionKey = 'pk';
const sortKey = 'sk';
const definitionAttribute = 'def';

module.exports = {
  dynamodb,
  tableName,
  sortKeyIndex,
  assetTypes: {
    'visuals': 'visuals',
    'audible': 'audible',
    'anime': 'anime',
    'characters': 'characters',
  },
  schema: {
    partitionKey,
    sortKey,
    timeStampAttribute,
    definitionAttribute
  },
};
