import { vi } from "vitest";

vi.mock("@aws-sdk/client-eventbridge", async () => {
  const EventBridgeClient = vi.fn();
  EventBridgeClient.prototype.send = vi.fn();

  const PutEventsCommand = vi.fn();

  return {
    EventBridgeClient,
    PutEventsCommand,
  };
});
