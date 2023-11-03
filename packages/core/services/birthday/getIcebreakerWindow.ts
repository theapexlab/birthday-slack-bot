import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Icebreaker questions are sent to the random channel on the first Tuesday of every month.
// The window includes people whose birthday is between the next question and the third next question.
// The start is inclusive, the end is exclusive.
// This ensures that everyone gets exactly two questions per year and responses are not too close to the birthday.
// E.g if today is 2023-11-01, the window is between 2023-12-05 and 2024-02-06.

export const getIceBreakerWindow = () => {
  const today = dayjs().utc().startOf("day");

  const startOfStartMonth = today.add(1, "month").startOf("month");
  let windowStart = startOfStartMonth.set("day", 2);

  if (windowStart.month() !== startOfStartMonth.month()) {
    windowStart = windowStart.add(7, "day");
  }

  const startOfEndMonth = today.add(3, "month").startOf("month");
  let windowEnd = startOfEndMonth.set("day", 2);

  if (windowEnd.month() !== startOfEndMonth.month()) {
    windowEnd = windowEnd.add(7, "day");
  }

  return {
    start: windowStart,
    end: windowEnd,
  };
};
