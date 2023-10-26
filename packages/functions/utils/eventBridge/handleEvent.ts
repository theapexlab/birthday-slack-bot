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

        const parsedType = parsedRecord["detail-type"];

        if (type !== parsedType) {
          throw new Error(`Expected event type ${parsedType} but got ${type}`);
        }
        const detail = parsedRecord.detail as Events[T];

        return handler(detail);
      }),
    );
