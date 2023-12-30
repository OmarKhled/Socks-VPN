const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const socks = require("socksv5");
const { Client } = require("ssh2");

var child_process = require("child_process");

require("electron-reloader")(module);

if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;

const sshConfig = {
  host: "197.60.71.100",
  port: 5500,
  username: "mohamed",
  password: "1234",
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let server;

ipcMain.on("power:off", () => {
  server.close();
  mainWindow.webContents.send("power:off");
  console.log("SOCKS server closed");
  server = null;
});

ipcMain.on("power:on", () => {
  server = null;
  console.log("object");
  let first = true;
  server = socks
    .createServer((info, accept, deny) => {
      // console.log("created");

      if (first) {
        child_process.exec(
          'google-chrome --proxy-server="socks5://localhost:5500"'
        );
        mainWindow.webContents.send("power:on");
        first = false;
      }
      const conn = new Client();
      conn
        .on("ready", () => {
          // console.log("ready");

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
                // console.log("clientSocket");
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

  console.log("Swicth on");
});
