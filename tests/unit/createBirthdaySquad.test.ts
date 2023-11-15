import "@/testUtils/unit/mockDb";
import "@/testUtils/unit/mockEventBridge";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as getSquadMembers from "@/db/queries/getSquadMembers";
import { users } from "@/db/schema";
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
  converastionId: "CH001",
}));

vi.mock("@/services/slack/openConversation", async () => ({
  openConversation: vi.fn().mockResolvedValue(constants.converastionId),
}));

describe("createBirthdaySquad", () => {
  let openConversationMock: Mock;
  let eventBridge: EventBridgeClient;

  beforeEach(() => {
    openConversationMock = openConversation as Mock;
    eventBridge = new EventBridgeClient();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
  });

  it("Should call getSquadMembers", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];
    const getSquadMembersSpy = vi.spyOn(getSquadMembers, "getSquadMembers");

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getSquadMembersSpy).toHaveBeenCalledWith(
      constants.teamId,
      constants.birthdayPerson,
    );
  });
  it("Should call getRandomSquadMembers if the appliedSquadMembers size less then 3", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson],
      limit: BIRTHDAY_SQUAD_SIZE,
    });
  });
  it("Should not call openConverstaion if the final squad size is less then 2", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson],
      limit: BIRTHDAY_SQUAD_SIZE,
    });

    expect(openConversation).not.toBeCalled();
  });
  it("Should not call publishEvent if the final squad size is less then 2", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).toHaveBeenCalledWith({
      teamId: constants.teamId,
      usersToExclude: [constants.birthdayPerson],
      limit: BIRTHDAY_SQUAD_SIZE,
    });

    expect(PutEventsCommand).not.toBeCalled();
    expect(eventBridge.send).not.toBeCalled();
  });
  it("Should not call getRandomSquadMembers if the appliedSquadMembers size 3 or more", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];
    const getRandomSquadMembersSpy = vi.spyOn(
      getSquadMembers,
      "getRandomSquadMembers",
    );

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

    await seedSquadJoins(
      constants.birthdayPerson,
      constants.teamId,
      constants.otherUserIds,
      3,
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(getRandomSquadMembersSpy).not.toHaveBeenCalled();
  });
  it("Should call openConversation if the appliedSquadMembers size 3 or more", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];

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

    const insertedSquadMembers = await seedSquadJoins(
      constants.birthdayPerson,
      constants.teamId,
      constants.otherUserIds,
      3,
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(openConversation).toBeCalledWith(
      expect.arrayContaining(insertedSquadMembers),
    );
  });
  it("Should publish sendSquadWelcomeMessage with the conversationId after the squad creation", async () => {
    const event = {
      birthdayPerson: constants.birthdayPerson,
      eventId: constants.eventId,
      team: constants.teamId,
    } satisfies Events["createBirthdaySquad"];

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

    await seedSquadJoins(
      constants.birthdayPerson,
      constants.teamId,
      constants.otherUserIds,
      3,
    );

    openConversationMock.mockResolvedValueOnce(constants.converastionId);

    await sendMockSqsMessage("createBirthdaySquad", event, handler);

    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("sendSquadWelcomeMessage", {
        conversationId: constants.converastionId,
        birthdayPerson: constants.birthdayPerson,
        team: constants.teamId,
        eventId: constants.eventId,
      }),
    );
  });
});
