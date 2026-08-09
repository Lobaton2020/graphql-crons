import type { GraphQLContext } from "../../context";
import { inputParsers, requireUserId } from "../../../controllers/validators";

export const fcmTokenResolvers = {
  Mutation: {
    registerDevice: async (
      _: unknown,
      args: { deviceId: string; token: string },
      ctx: GraphQLContext,
    ): Promise<string> => {
      const input = inputParsers.registerDevice({
        deviceId: args.deviceId,
        token: args.token,
        platform: "android",
      });
      return ctx.fcmTokenController.register(
        requireUserId(ctx),
        input.deviceId,
        input.token,
        input.platform,
      );
    },
  },
};
