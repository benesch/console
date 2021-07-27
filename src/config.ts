interface Config {
  fronteggUrl: string;
  segmentApiKey: string | null;
  sentryDsn: string | null;
  sentryEnvironment: string | null;
  sentryRelease: string | null;
}

const config = (globalThis as any).CONFIG as Config;

export default config;
