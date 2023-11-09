import { vi } from "vitest";

vi.mock("@aws-sdk/client-scheduler", async () => {
  const SchedulerClient = vi.fn();
  SchedulerClient.prototype.send = vi.fn();

  const CreateScheduleCommand = vi.fn();

  return {
    SchedulerClient,
    CreateScheduleCommand,
  };
});
