import "@/testUtils/unit/mockDb";
import "@/testUtils/unit/mockEventBridge";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as getSquadMembers from "@/db/queries/getSquadMembers";
import { squadJoins, users } from "@/db/schema";
import type { Events } from "@/events";
import { handler } from "@/functions/events/createBirthdaySquad";
import { BIRTHDAY_SQUAD_SIZE } from "@/functions/utils/constants";
import { openConversation } from "@/services/slack/openConversation";
import { seedSquadJoins } from "@/testUtils/seedSquadJoins";
import { testDb } from "@/testUtils/testDb";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import { sendMockSqsMessage } from "@/testUtils/unit/sendMockSqsMessage";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  birthdayPerson: "U001",
  eventId: "E001",
  teamId: "T001",
  otherUserIds: ["U002", "U003", "U004", "U005", "U006"],
  conversationId: "CH001",
  krisztaUserId: "KU001",
  mateUserId: "MU001",
}));

const event = vi.hoisted(
  () =>
    ({
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    }) satisfies Events["createBirthdaySquad"],
);

vi.mock("@/services/slack/openConversation", async () => ({
  openConversation: vi.fn().mockResolvedValue(constants.conversationId),
}));

vi.mock("sst/node/config", () => ({
  Config: {
    KRISZTA_SLACK_USER_ID: constants.krisztaUserId,
    MATE_SLACK_USER_ID: constants.mateUserId,
  },
}));

describe("Final squad size is less then 2", () => {
  let eventBridge: EventBridgeClient;

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
  });

  it("Should not call openConversation", async () => {
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson, constants.krisztaUserId],
      limit: BIRTHDAY_SQUAD_SIZE,
    });

    expect(openConversation).not.toBeCalled();
  });

  it("Should not publish sendSquadWelcomeMessage event", async () => {
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson, constants.krisztaUserId],
      limit: BIRTHDAY_SQUAD_SIZE,
    });

    expect(PutEventsCommand).not.toBeCalled();
    expect(eventBridge.send).not.toBeCalled();
  });
});

describe("2 or less squad members applied", () => {
  it("Should call getRandomSquadMembers", async () => {
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson, constants.krisztaUserId],
      limit: BIRTHDAY_SQUAD_SIZE,
    });
  });
});

describe("3 or more squad members applied", () => {
  let insertedSquadMembers: string[];

  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(squadJoins);

    await testDb.insert(users).values({
      id: constants.birthdayPerson,
      teamId: constants.teamId,
      birthday: dayjs.utc().toDate(),
    });

    await testDb.insert(users).values(
      constants.otherUserIds.map((userId) => ({
        id: userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      })),
    );

    insertedSquadMembers = await seedSquadJoins(
      constants.birthdayPerson,
      constants.teamId,
      constants.otherUserIds,
      3,
    );
  });

  afterAll(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
    await testDb.delete(squadJoins);
  });

  it("Should not call getRandomSquadMembers", async () => {
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).not.toHaveBeenCalled();
  });

  it("Should call openConversation", async () => {
    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(openConversation).toBeCalledWith(
      expect.arrayContaining(insertedSquadMembers),
    );
  });

  it("Should publish sendSquadWelcomeMessage event", async () => {
    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("sendSquadWelcomeMessage", {
        conversationId: constants.conversationId,
        birthdayPerson: constants.birthdayPerson,
        team: constants.teamId,
        eventId: constants.eventId,
      }),
    );
  });
});
describe("Add admin to the squad", () => {
  let insertedSquadMembers: string[];

  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(squadJoins);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
    await testDb.delete(squadJoins);
  });

  it("Should add Kriszta to conversation", async () => {
    await testDb.insert(users).values({
      id: constants.birthdayPerson,
      teamId: constants.teamId,
      birthday: dayjs.utc().toDate(),
    });

    await testDb.insert(users).values(
      constants.otherUserIds.map((userId) => ({
        id: userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      })),
    );

    insertedSquadMembers = await seedSquadJoins(
      constants.birthdayPerson,
      constants.teamId,
      constants.otherUserIds,
      3,
    );

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(openConversation).toBeCalledWith(
      expect.arrayContaining([
        ...insertedSquadMembers,
        constants.krisztaUserId,
      ]),
    );
  });

  it("Should add Mate to conversation if it's Krista's birthday", async () => {
    await testDb.insert(users).values({
      id: constants.krisztaUserId,
      teamId: constants.teamId,
      birthday: dayjs.utc().toDate(),
    });

    await testDb.insert(users).values(
      constants.otherUserIds.map((userId) => ({
        id: userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      })),
    );

    insertedSquadMembers = await seedSquadJoins(
      constants.krisztaUserId,
      constants.teamId,
      constants.otherUserIds,
      3,
    );

    await sendMockSqsMessage(
      "createBirthdaySquad",
      { ...event, birthdayPerson: constants.krisztaUserId },
      handler,
    );

    expect(openConversation).toBeCalledWith(
      expect.arrayContaining([...insertedSquadMembers, constants.mateUserId]),
    );
  });
});
