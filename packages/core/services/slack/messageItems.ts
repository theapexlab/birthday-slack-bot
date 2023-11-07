import type { ActionsBlock, SectionBlock } from "@slack/web-api";

export const makeTextBlock = (text: string): SectionBlock => ({
  type: "section",
  text: {
    type: "mrkdwn",
    text,
  },
});

export const makeTextBlockWithDatepicker = (
  text: string,
  actionId: string,
): SectionBlock => ({
  ...makeTextBlock(text),
  accessory: {
    type: "datepicker",
    initial_date: "1995-01-01",
    placeholder: {
      type: "plain_text",
      text: "Select a date",
      emoji: true,
    },
    action_id: actionId,
  },
});

export const makeActionsBlock = (
  yesActionId: string,
  noActionId: string,
  yesValue: string,
  noValue: string,
): ActionsBlock => ({
  type: "actions",
  elements: [
    {
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: "Yes",
      },
      style: "primary",
      action_id: yesActionId,
      value: yesValue,
    },
    {
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: "No",
      },
      style: "danger",
      action_id: noActionId,
      value: noValue,
    },
  ],
});
