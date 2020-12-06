/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_AMIIASSETSNONPROD_ARN
	STORAGE_AMIIASSETSNONPROD_NAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: `amiiassets-${process.env.ENV}`,
  IndexName: 'asset_type-sort_key-index',
  KeyConditionExpression: 'asset_type = :value and sort_key = :type',
  ExpressionAttributeValues: { ':value': 'visual', ':type' : 'primary' },
}

async function queryItems(){
  try {
    return await docClient.query(params).promise()
  } catch (err) {
    return err
  }
}

exports.handler = async (event, context) => {
  try {
    const data = await queryItems()
    return { body: JSON.stringify(data) }
  } catch (err) {
    return { error: err }
  }
}
