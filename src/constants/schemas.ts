import z from "zod";
import { Dispatch, SetStateAction } from "react";

export const roomAnalysis = z.object({
  roomId: z.string(),
  id: z.string(),

  numberOfPackets: z.number(),
});

const messageSchema = z.object({
  id: z.string(),
  message: z.string(),
  roomId: z.string(),
  sentAt: z.date(),
  requetsN: z.number(),
});

export type Message = z.TypeOf<typeof messageSchema>;

const analysisSchema = z.object({
  roomId: z.string(),
  packetLoss: z.number(),
  averageRoundTripTime: z.number(),
});

export type Analysis = z.TypeOf<typeof analysisSchema>;

export const messageSubSchema = z.object({
  roomId: z.string(),
});

export const createRoomSchema = z.object({
  name: z.string(),
});
