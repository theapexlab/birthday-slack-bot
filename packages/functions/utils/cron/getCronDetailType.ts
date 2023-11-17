export type CronEventType = "iceBreaker" | "daily";

export const getCronDetailType = (type: CronEventType, stage: string) =>
  `${type}-${stage}`;
