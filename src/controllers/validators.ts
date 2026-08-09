import { z } from "zod";
import type { GraphQLContext } from "../views/context";

const idSchema = z.coerce.number().int().positive();

const newCronSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.string().min(1),
});

const editCronSchema = newCronSchema;

const newTaskSchema = z.object({
  description: z.string(),
  hour: z.number().int().min(0).max(23).nullable().optional(),
  minute: z.number().int().min(0).max(59).nullable().optional(),
  projectId: idSchema.nullable().optional(),
});

const editTaskSchema = z.object({
  description: z.string().optional(),
  hour: z.number().int().min(0).max(23).nullable().optional(),
  minute: z.number().int().min(0).max(59).nullable().optional(),
  state: z.boolean().optional(),
  projectId: idSchema.nullable().optional(),
});

const registerDeviceSchema = z.object({
  deviceId: z.string().min(1).max(500),
  token: z.string().min(1).max(500),
  platform: z.enum(["android", "ios", "web"]).default("android"),
});

export const inputParsers = {
  cronId: (id: unknown) => idSchema.parse(id),
  newCron: (input: unknown) => newCronSchema.parse(input),
  editCron: (input: unknown) => editCronSchema.parse(input),
  newTask: (input: unknown) => newTaskSchema.parse(input),
  editTask: (input: unknown) => editTaskSchema.parse(input),
  registerDevice: (input: unknown) => registerDeviceSchema.parse(input),
};

export function requireUserId(ctx: GraphQLContext): number {
  return ctx.userId;
}
