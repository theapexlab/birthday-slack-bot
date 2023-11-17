import type { ManipulateType } from "dayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getScheduleWithTimeOffset = (
  offset: number,
  type: ManipulateType,
): string => {
  let scheduleTime = dayjs()
    .utc()
    .hour(11)
    .minute(0)
    .second(0)
    .add(offset, type);

  // Check if the day is Saturday (6) or Sunday (0)
  if (scheduleTime.day() === 6) {
    // If Saturday, add 2 days to move to Monday
    scheduleTime = scheduleTime.add(2, "days");
  } else if (scheduleTime.day() === 0) {
    // If Sunday, add 1 day to move to Monday
    scheduleTime = scheduleTime.add(1, "days");
  }

  return `at(${scheduleTime.format("YYYY-MM-DDTHH:mm:ss")})`;
};
