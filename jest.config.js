const outputs = require('../config/settings/local.outputs.json');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    CONFIG: {
      cognitoRegion: outputs.cognito_region,
      cognitoUserPoolId: outputs.cognito_user_pool_id,
      cognitoWebClientId: outputs.cognito_web_client_id,
    }
  }
};
