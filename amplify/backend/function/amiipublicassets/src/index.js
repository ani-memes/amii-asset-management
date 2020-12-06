/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_AMIIASSETSTORAGE_ARN
	STORAGE_AMIIASSETSTORAGE_NAME
Amplify Params - DO NOT EDIT */

exports.handler = async (event) => {
    const response = {
        statusCode: 200,
     headers: {
         "Access-Control-Allow-Origin": "*"
     },
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
