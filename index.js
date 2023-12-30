const { Client } = require("ssh2");
const socks = require("socksv5");
// import { Client } from "ssh2";

// const conn = new Client();
// conn
//   .on("ready", () => {
//     console.log("Client :: ready");
//     conn.shell((err, stream) => {
//       if (err) throw err;
//       stream
//         .on("close", () => {
//           console.log("Stream :: close");
//           conn.end();
//         })
//         .on("data", (data) => {
//           console.log("OUTPUT: " + data);
//         });
//       stream.end("ls -l\nexit\n");
//     });
//   })
//   .connect({
//     host: "197.60.71.100",
//     port: 5500,
//     username: "mohamed",
//     password: "1234",
//   });

// let server = net.createServer();

// server.listen({ port: 2020 }, function () {
//   console.log("server listening to %j", server.address());
//   const client = net.createConnection({ port: 2020 }, () => {
//     console.log("Connected to server!");
//     client.write("Hello, server!");
//   });
// });
// server.on("error", (err) => {
//   console.error("Server error:", err);
// });
// server.on("connection", function (conn) {
//   console.log("conn.address");
// });

const sshConfig = {
  host: "197.60.71.100",
  port: 5500,
  username: "mohamed",
  password: "1234",
};

const server = socks
  .createServer((info, accept, deny) => {
    console.log("created");
    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("ready");
        conn.forwardOut(
          info.srcAddr,
          info.srcPort,
          info.dstAddr,
          info.dstPort,
          (err, stream) => {
            if (err) {
              conn.end();
              return deny();
            }

            const clientSocket = accept(true);
            if (clientSocket) {
              console.log("clientSocket");
              stream
                .pipe(clientSocket)
                .pipe(stream)
                .on("close", () => {
                  conn.end();
                });
            } else {
              conn.end();
            }
          }
        );
      })
      .on("error", (err) => {
        deny();
      })
      .connect(sshConfig);
  })
  .listen(5500, "localhost", () => {
    console.log("SOCKSv5 proxy server started on port 5500");
    socks.connect(
      {
        host: "localhost",
        port: 5500,
        proxyHost: "localhost",
        proxyPort: 5500,
        auths: [socks.auth.None()],
      },
      function (socket) {
        if (socket) {
          console.log("Packet sent!");
          socket.write("Hello, SOCKS server!");
        }
      }
    );
  })
  .useAuth(socks.auth.None());

server.on("error", (err) => {
  console.error("Server error:", err);
});
