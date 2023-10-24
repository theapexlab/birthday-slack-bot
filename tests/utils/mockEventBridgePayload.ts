import type { Events, EventType } from "@/events";

export const mockEventBridgePayload = <T extends EventType>(
  type: T,
  body: Events[T],
) => ({
  Entries: [
    {
      Detail: JSON.stringify(body),
      DetailType: type,
      EventBusName: process.env.EVENT_BUS_NAME,
      Source: "sst",
    },
  ],
});
