/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_AMIIASSETSNONPROD_ARN
	STORAGE_AMIIASSETSNONPROD_NAME
Amplify Params - DO NOT EDIT */

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*"
    //  }, 
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
