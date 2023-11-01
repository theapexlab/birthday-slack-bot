/* eslint-disable */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SLACK_SIGNING_SECRET: string;
  readonly VITE_SLACK_BOT_TOKEN: string;
  readonly VITE_SLACK_USER_ID: string;
  readonly VITE_CORE_SLACK_CHANNEL_ID: string;
  readonly VITE_RANDOM_SLACK_CHANNEL_ID: string;
  readonly VITE_SLACK_BOT_USER_ID: string;
  readonly VITE_SLACK_DM_ID: string;
  readonly VITE_SLACK_TEAM_ID: string;
  readonly VITE_CI: string | undefined;
  readonly VITE_DB_NAME: string | undefined;
  readonly VITE_DB_SECRET_ARN: string | undefined;
  readonly VITE_DB_CLUSTER_ARN: string | undefined;
  readonly VITE_DB_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
