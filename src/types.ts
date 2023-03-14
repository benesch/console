/** Global configuration parameters. */

export {};

declare global {
  const __DEFAULT_STACK__: string;
  const __FORCE_OVERRIDE_STACK__: string;
  const __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: boolean;
  const __SEGMENT_API_KEY__: string | null;
  const __SENTRY_DSN__: string | null;
  const __SENTRY_ENVIRONMENT__: string | null;
  const __SENTRY_RELEASE__: string | null;
  const __STATUSPAGE_ID__: string;
}
