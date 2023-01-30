import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "./router";
import { createContext } from "./router/context";
import { z } from "zod";
import { Events } from "../constants/events";
import { trpc } from "../utils/trpc";
import { Analysis } from "../constants/schemas";
import { EventEmitter } from "stream";
const wss = new ws.Server({
  port: 3001,
});

const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", (e) => {
  console.log(`Got a connection ${wss.clients.size}`);
  wss.once("close", () => {
    console.log(`Closed connection ${wss.clients.size}`);
  });
});
console.log(`wss server start at ws://localhost:3001`);

process.on("SIGTERM", () => {
  console.log("Got SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});

export function testPacketLoss(
  socket: ws.WebSocket,
  numPackets: number,
  temp: EventEmitter
) {
  const packetSize = 1024;
  let receivedPackets = 0;
  let startTime = Date.now();

  for (let i = 0; i < numPackets; i++) {
    const data = new Array(packetSize).fill("0").join("");
    socket.send(JSON.stringify({ data }));
  }

  socket.on("message", (data) => {
    console.log("this was triggered");
    receivedPackets++;
    const parsedData = JSON.parse(data.toString());
    if (receivedPackets === numPackets) {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const packetLoss = 100 - (receivedPackets / numPackets) * 100;
      // console.log(`Packet loss: ${packetLoss}%`);
      // console.log(`Average round-trip time: ${totalTime / numPackets} ms`);
      socket.emit(Events.ANALYZE, {
        packetLoss: packetLoss,
        averageRoundTripTime: totalTime / numPackets,
        roomId: "cool room",
      } as Analysis);
    }
  });
  socket.on(Events.ANALYZE, function (result: Analysis) {
    // console.log("Received packet loss result:", result);
    console.log("emitted: ");
    console.log(result);
  });
}
