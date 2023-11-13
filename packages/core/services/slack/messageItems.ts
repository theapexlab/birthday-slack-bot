import type { ActionsBlock, Button, SectionBlock } from "@slack/web-api";

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

type ButtonArgs = {
  actionId: string;
  text: string;
  value: string;
  style: Button["style"];
};

export const makeActionsBlock = (buttons: ButtonArgs[]): ActionsBlock => ({
  type: "actions",
  elements: buttons.map(({ actionId, text, value, style }) => ({
    type: "button",
    text: {
      type: "plain_text",
      emoji: true,
      text,
    },
    value,
    style,
    action_id: actionId,
  })),
});

export const makeInputBlock = (
  label: string,
  blockId: string,
  actionId: string,
  multiline = false,
) => ({
  type: "input",
  block_id: blockId,
  element: {
    type: "plain_text_input",
    multiline,
    action_id: actionId,
  },
  label: {
    type: "plain_text",
    text: label,
  },
});

export const makeCheckboxInputBlock = (
  label: string,
  blockId: string,
  actionId: string,
) => ({
  type: "input",
  block_id: blockId,
  element: {
    type: "checkboxes",
    action_id: actionId,
    options: [
      {
        text: {
          type: "plain_text",
          text: "Sure!",
          emoji: true,
        },
        value: "true",
      },
    ],
  },
  label: {
    type: "plain_text",
    text: label,
  },
});
