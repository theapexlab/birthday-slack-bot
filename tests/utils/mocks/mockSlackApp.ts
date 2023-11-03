import { vi } from "vitest";

vi.mock("@/services/slack/createSlackApp", () => ({
  createSlackApp: vi.fn().mockReturnValue({
    client: {
      chat: {
        postMessage: vi.fn(),
      },
    },
  }),
}));
