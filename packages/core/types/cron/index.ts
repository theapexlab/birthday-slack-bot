export type CronEventType = "iceBreaker" | "daily";

export const getCronEvent = (type: CronEventType, stage: string) =>
  `${type}-${stage}`;
