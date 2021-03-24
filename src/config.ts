interface Config {
  cognitoRegion: string;
  cognitoUserPoolId: string;
  cognitoWebClientId: string;
}

const config = (globalThis as any).CONFIG as Config;

export default config;
