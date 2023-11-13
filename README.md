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

## DB Setup

1. Make sure you have docker-compose available.
2. Copy the `.env` file to a `.env.local` file.
3. Run `docker-compose up -d` to start the database.
4. # Run `pnpm migration:local` to run the migrations.

## Run locally

`pnpm dev`

### Add webhook url to Slack

1. Find the ApiEndpoint url of your deployed app in the console output.
2. Open the `Event Subscriptions` sub-page.
3. Add the url: `<ApiEndpoint>/slack/event` to the `Request URL` field.
4. Slack sends a challenge request to the url to verify the endpoint. Make sure you have the app running locally for it to succeed.
5. Open the `Interactivity & Shortcuts` sub-page.
6. Add the url: `<ApiEndpoint>/slack/interaction` to the `Request URL` field.

## Run tests

Fill `.env.local` file with the secrets.

### Run all tests in watch mode

```bash
pnpm test
```

### Run unit tests

```bash
pnpm test:unit
```

### Run integration tests

```bash
pnpm test:integration
```

### Run all tests

```bash
pnpm test:ci
```

### Manual testing

All urls are displayed in the console output.

- Send out icebreaker question: open `<ApiEndpoint>/icebreaker`
- Ask birthday from everyone: open `<ApiEndpoint>/botJoined`
- Ask birthday from specific user: open `<ApiEndpoint>/userJoined?userId=<slack user id>`
- Send out birthday fill reminder: open `<ApiEndpoint>/daily`
  - Only sends it out to users who have not filled in their birthday yet.
  - Sends it out related to users whose birthday is in exactly 2 months.

## Generate a new migration

```bash
pnpm migration:generate
```
