const AWS = require('aws-sdk');

AWS.config.update({region: process.env.TABLE_REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const env = process.env.ENV;
const tableName = `AMIIAssets${
  env && env !== "NONE" ?
    `-${env}` : ''
}`;

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
