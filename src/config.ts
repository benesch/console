interface Config {
  cognitoRegion: string;
  cognitoUserPoolId: string;
  cognitoWebClientId: string;
  fullStoryOrgId: string;
  sentryDsn: string;
  sentryEnvironment: string;
  sentryRelease: string;
}

const config = (globalThis as any).CONFIG as Config;

export default config;
