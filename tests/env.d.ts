/* eslint-disable */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SLACK_SIGNING_SECRET: string;
  readonly VITE_SLACK_BOT_TOKEN: string;
  readonly VITE_SLACK_USER_ID: string;
  readonly VITE_SLACK_CHANNEL_ID: string;
  readonly VITE_SLACK_BOT_USER_ID: string;
  readonly VITE_SLACK_DM_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
