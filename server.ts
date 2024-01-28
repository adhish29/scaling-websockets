// import WebSocket, { WebSocketServer } from "ws";
// import { createClient } from "redis";

// const APPID = process.env.APPID;
// const channel: string = "livechat";

// const wss = new WebSocketServer({ port: 8080 });

// (async () => {
//   const publisher = createClient({
//     socket: {
//       host: "redis",
//       port: 6379,
//     },
//   });

//   const subscriber = createClient({
//     socket: {
//       host: "redis",
//       port: 6379,
//     },
//   });

//   await publisher.connect();
//   await subscriber.connect();

//   wss.on("connection", (ws) => {
//     console.log(`connected to ::: ${APPID}`);
//     ws.send(`connected to ::: ${APPID}`);
//     ws.on("error", console.error);
//     ws.on("message", (message) => {
//       console.log(`${APPID} received message ${message}`);
//       //publish the message to redis
//       publisher.publish(channel, message.toString());
//     });
//   });

//   subscriber.subscribe(channel, (message) => {
//     console.log(
//       `${APPID} received message in channel ${channel} msg: ${message}`
//     );
//     console.log(message);
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(APPID + " : " + message);
//       }
//     });
//   });
// })();

// ---------------------------------------------------------------------------

import WebSocket, { WebSocketServer } from "ws";
import { createClient } from "redis";

const APPID = <string>process.env.APPID;
const channel: string = "livechat";

const wss = new WebSocketServer({ port: 8080 });

interface MessageBody {
  server: string;
  payload: string;
}

(async () => {
  const publisher = createClient({
    socket: {
      host: "redis",
      port: 6379,
    },
  });

  const subscriber = createClient({
    socket: {
      host: "redis",
      port: 6379,
    },
  });

  await publisher.connect();
  await subscriber.connect();

  wss.on("connection", (ws) => {
    console.log(`connected to ::: ${APPID}`);
    ws.send(`connected to ::: ${APPID}`);
    ws.on("error", console.error);
    ws.on("message", (message) => {
      console.log(`${APPID} received message ${message}`);
      //publish the message to redis
      const publishedMsg: MessageBody = {
        server: APPID,
        payload: message.toString(),
      };
      publisher.publish(channel, JSON.stringify(publishedMsg));
    });
  });

  subscriber.subscribe(channel, (message) => {
    console.log(
      `${APPID} received message in channel ${channel} msg: ${message}`
    );

    const parsedMessage: MessageBody = JSON.parse(message);
    wss.clients.forEach((client) => {
      if (
        APPID !== parsedMessage.server &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(APPID + " : " + parsedMessage.payload);
      }
    });
  });
})();
