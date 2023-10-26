# Birthday slack bot

## Description

Helps teams to find the best birthday gift for their colleagues.

## Get started

### Create a New Slack App

1. Create a new Slack app on the [Slack App Dashboard](https://api.slack.com/apps). (From scratch)
2. Navigate to `Basic Information` and make a copy of your `Signing Secret`.
3. Navigate to `OAuth & Permissions` sub-page -> install app to workspace -> save your `Bot User OAuth Token`.
4. Then scroll below to the `Scopes` section and add these Bot Token Scopes:

- channels:read
- chat:write
- groups:read
- im:write
- mpim:read
- users:read
- channels:history
- groups:history
- im:history
- mpim:history

5. Open the `Event Subscriptions` sub-page -> enable events. (We will add the url later.)
6. Scroll below `Subscribe to bot events` and add these scopes:

- member_joined_channel
- member_left_channel

7. Open the `Interactivity & Shortcuts` sub-page -> enable interactivity. (We will add the url later.)

### The bot works with two channels:

- The core channel is the single source of truth regarding members who are part of the team.
- The random channel is where the bot will post the gift wish teaser messsages.

You can use the same channel for both it is up to you.

Make sure you have the channel id(s) and add the bot to both channel(s).

### SST Setup

1. Ensure you have an AWS IAM user.
2. Set secrets:

```bash
npx sst secrets set SLACK_LOG_LEVEL debug
npx sst secrets set SLACK_BOT_TOKEN <your-bot-token>
npx sst secrets set SLACK_SIGNING_SECRET <your-signing-secret>
npx sst secrets set CORE_SLACK_CHANNEL_ID <your-test-channel>
npx sst secrets set RANDOM_SLACK_CHANNEL_ID <your-test-channel>
```

3. Install dependencies: `pnpm i`
4. Run sst: `pnpm dev`

### Add webhook url to Slack

1. Find the ApiEndpoint url of your deployed app in the console output.
2. Open the `Event Subscriptions` sub-page.
3. Add the url: `<ApiEndpoint>/api/slack/event` to the `Request URL` field.
4. Slack sends a challenge request to the url to verify the endpoint. Make sure you have the app running locally for it to succeed.
5. Open the `Interactivity & Shortcuts` sub-page.
6. Add the url: `<ApiEndpoint>/api/slack/interaction` to the `Request URL` field.

## Run tests

Copy the `.env` file to a `.env.local` file and add the secrets.

```bash
pnpm test
```
