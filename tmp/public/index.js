/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_AMIIASSETSTORAGE_ARN
	STORAGE_AMIIASSETSTORAGE_NAME
Amplify Params - DO NOT EDIT */

const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) =>
  awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
