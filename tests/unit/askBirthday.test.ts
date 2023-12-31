import "@/testUtils/unit/mockSlackApp";
import "@/testUtils/unit/mockDb";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Mock } from "vitest";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getUsersWhoseBirthdayIsMissing } from "@/db/queries/getBirthdays";
import { users } from "@/db/schema";
import type { Events } from "@/events";
import { handler } from "@/functions/events/askBirthday";
import { constructAskBirthdayMessage } from "@/services/slack/constructAskBirthdayMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { testDb } from "@/testUtils/testDb";
import { sendMockSqsMessage } from "@/testUtils/unit/sendMockSqsMessage";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  otherBotUserId: "B999",
  userId: "U001",
  userName: "Foo",
  eventId: "E001",
  team_id: "T001",
}));

vi.mock("@/services/slack/getUserInfo", async () => ({
  getUserInfo: vi.fn().mockResolvedValue({
    user: {
      is_bot: false,
      team_id: constants.team_id,
      profile: {
        first_name: constants.userName,
      },
    },
  }),
}));

describe("Member joined channel", () => {
  let getUserInfoMock: Mock;
  let createSlackAppMock: Mock;

  beforeEach(() => {
    getUserInfoMock = getUserInfo as Mock;
    createSlackAppMock = createSlackApp as Mock;
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
  });

  it("Should not do anything if user is a bot", async () => {
    const event = {
      user: constants.otherBotUserId,
      eventId: constants.eventId,
    } satisfies Events["askBirthday"];

    getUserInfoMock.mockResolvedValueOnce({
      user: {
        is_bot: true,
      },
    });

    await sendMockSqsMessage("askBirthday", event, handler);

    expect(createSlackAppMock).not.toHaveBeenCalled();
  });

  it("Should send dm to user if exists and not bot", async () => {
    const event = {
      user: constants.userId,
      eventId: constants.eventId,
    } satisfies Events["askBirthday"];

    const sendDMMock = vi.spyOn(
      createSlackAppMock().client.chat,
      "postMessage",
    );

    await sendMockSqsMessage("askBirthday", event, handler);

    expect(sendDMMock).toHaveBeenCalledOnce();
    expect(sendDMMock).toHaveBeenCalledWith(
      constructAskBirthdayMessage({
        eventId: constants.eventId,
        name: constants.userName,
        user: constants.userId,
      }),
    );
  });
});

describe("getUsersWhoseBirthdayIsMissing", () => {
  beforeAll(async () => {
    await testDb.delete(users);
  });
  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
  });

  const mockUser = {
    birthday: null,
    id: constants.userId,
    teamId: constants.team_id,
  };

  it("should return with the mock user", async () => {
    await testDb.insert(users).values([mockUser]);
    const result = await getUsersWhoseBirthdayIsMissing();

    expect(result).toEqual([mockUser]);
  });

  it("shouldn't find any users", async () => {
    const mockUserWithBirthday = {
      ...mockUser,
      birthday: dayjs.utc().toDate(),
    };

    await testDb.insert(users).values([mockUserWithBirthday]);
    const result = await getUsersWhoseBirthdayIsMissing();

    expect(result).toEqual([]);
  });
});
