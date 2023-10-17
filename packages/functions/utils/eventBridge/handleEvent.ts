import type { Events, EventType } from "@/events";

export const handleEvent =
  <T extends EventType>(
    type: T,
    handler: (payload: Events[T]) => Promise<void>,
  ) =>
  (payload: { detail: Events[T] }) =>
    handler(payload.detail);
