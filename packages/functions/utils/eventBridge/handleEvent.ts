import type { SQSEvent } from "aws-lambda";

import type { Events, EventType } from "@/events";

export const handleEvent =
  <T extends EventType>(
    type: T,
    handler: (payload: Events[T]) => Promise<void>,
  ) =>
  (event: SQSEvent) =>
    Promise.all(
      event.Records.map((record) => {
        const parsedRecord = JSON.parse(record.body);

        const type = parsedRecord["detail-type"];

        if (type !== type) {
          throw new Error(`Expected event type ${type} but got ${type}`);
        }
        const detail = parsedRecord.detail as Events[T];

        return handler(detail);
      }),
    );
