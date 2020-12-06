/* Amplify Params - DO NOT EDIT
	AUTH_COGNITO57495739_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: `amiiassets-${process.env.ENV}`,
  Item: {
    partition_key: '123456789',
    sort_key: 'primary',
    asset_type: 'visual',
    definition: JSON.stringify({
      ayy: 'lmao'
    })
  }
}

async function createItem() {
  try {
    await docClient.put(params).promise();
  } catch (err) {
    return err;
  }
}

exports.handler = async (event) => {
  try {
    await createItem()
    return {
      statusCode: 200,
      body: 'Successfully created item!',
    }
  } catch (err) {
    return {error: err}
  }
};
