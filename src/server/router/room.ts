import z from "zod";
import { createRouter } from "./context";
import { createRoomSchema, roomAnalysis } from "../../constants/schemas";
import { Events } from "../../constants/events";

// https://stackoverflow.com/questions/1248302/how-to-get-the-size-of-a-javascript-object
function roughSizeOfObject(object: boolean | string | Object | number) {
  var objectList = [];
  var stack = [object];
  var bytes = 0;

  while (stack.length) {
    var value = stack.pop();

    if (typeof value === "boolean") {
      bytes += 4;
    } else if (typeof value === "string") {
      bytes += value.length * 2;
    } else if (typeof value === "number") {
      bytes += 8;
    } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (var i in value) {
        stack.push(value[i as keyof typeof value]);
      }
    }
  }
  return bytes;
}

export const roomRouter = createRouter()
  .mutation("do-analysis", {
    input: roomAnalysis,
    async resolve({ ctx, input }) {
      const start = Date.now();
      let totalBytes = 0;

      for (let i = 0; i < input.numberOfPackets; i++) {
        const data = { i: i };
        ctx.ee.emit(Events.SEND_MESSAGE, data);
        totalBytes += roughSizeOfObject(data);
      }
      const end = Date.now();
      const totalTime = end - start;
      const averageRTT = totalTime / input.numberOfPackets;
      const bandwidth = totalBytes / totalTime; // bytes per second

      return await ctx.prisma.networkScan.create({
        data: {
          id: input.id,
          averageRoundTripTime: averageRTT,
          bandwidth: bandwidth,
          numberOfPackets: input.numberOfPackets,
          roomId: input.roomId,
        },
      });
    },
  })

  .mutation("createRoom", {
    input: createRoomSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.room.create({
        data: {
          name: input.name,
        },
      });
    },
  })

  .query("getAllRooms", {
    async resolve({ ctx }) {
      return await ctx.prisma.room.findMany();
    },
  })
  .query("getRoomAnalysis", {
    input: z.object({ roomId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.networkScan.findMany({
        where: {
          roomId: input.roomId,
        },
      });
    },
  });
