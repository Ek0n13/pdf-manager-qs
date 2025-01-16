import { app, shell, BrowserWindow, ipcMain, screen, dialog } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { join as pathJoin, parse as pathParse } from "path";
import { exec } from "child_process";
import * as fs from "fs";

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const cWidth: number = Math.ceil(width * 0.9);
  const cHeight: number = Math.ceil(height * 0.9);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: cWidth,
    height: cHeight,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: pathJoin(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(pathJoin(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("directory-dialog", async (_event) => {
    try {
      const dialogResult = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        // filters: [
        //   { name: 'PDF Files', extensions: ['pdf'] }
        // ]
      });

      if (!dialogResult) return null;

      if (dialogResult?.length != 1)
        throw new Error("Only a single directory is allowed");

      return dialogResult[0];
    } catch (error) {
      console.error("Error reading directory:", error);
      return null;
    }
  });

  ipcMain.handle("read-directory", async (_event, directory: string) => {
    try {
      const files = fs.readdirSync(directory);
      return files.filter((file) => file.endsWith(".pdf"));
    } catch (error) {
      console.error("Error reading directory:", error);
      return null;
    }
  });

  ipcMain.handle("get-child-directories", async (_event, directory: string) => {
    try {
      if (!directory) return null;

      const childDirs = fs.readdirSync(directory).filter((child) => {
        return fs.statSync(pathJoin(directory, child)).isDirectory();
      });

      return childDirs;
    } catch (error) {
      console.error("Error finding child directories:", error);
      return null;
    }
  });

  ipcMain.on("open-file", (_event, fileName: string, directory: string) => {
    const fullPath = pathJoin(directory, fileName);
    shell
      .openPath(fullPath)
      // .then(() => console.log('File opened'))
      .catch((err) => console.error("Error opening file:", err));
  });

  ipcMain.on("file-yt-search", (_event, fileString: string) => {
    const strippedFileName = pathParse(fileString).name.trim();

    const searchString = strippedFileName
      .replace(/&/g, "%26")
      .replace(/\'/g, "")
      .replace(/\"/g, "")
      .replace(/ /g, "+")
      .trim();

    const finalUrl = `https://www.youtube.com/results?search_query=${searchString}+hq`;

    openInEdge(finalUrl);
  });

  ipcMain.handle("join-paths", async (_event, ...paths: string[]) => {
    try {
      return pathJoin(...paths);
    } catch (error) {
      console.error("Error joining paths:", error);
      return null;
    }
  });

  ipcMain.handle("read-text-file", async (_event, filePath: string | null) => {
    const file = pathJoin(createLastPlayedDir(), filePath || "tattos.txt");

    try {
      if (!fs.existsSync(file)) {
        dialog.showMessageBoxSync({
          message: "File does not exist.",

          type: "warning",
          title: "Warning!",
        });

        return null;
      }

      return fs.readFileSync(file, "utf-8");
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  });

  ipcMain.on(
    "save-last-played",
    (_event, fileName: string | null, data: string) => {
      const file = pathJoin(createLastPlayedDir(), fileName || "tattos.txt");

      try {
        const result = dialog.showMessageBoxSync({
          message: "Save last played?",

          type: "question",
          buttons: ["Yes", "No"],
          defaultId: 0,
          cancelId: 1,
          title: "Confirm Action",
        });

        if (result === 0) {
          fs.writeFileSync(file, data);
        }
      } catch (error) {
        console.error("Error saving last played:", error);
      }
    },
  );

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
function openInEdge(url: string): void {
  const msedgePath = pathJoin(
    "C:",
    "Program Files (x86)",
    "Microsoft",
    "Edge",
    "Application",
    "msedge.exe",
  );

  if (!fs.existsSync(msedgePath)) {
    const result = dialog.showMessageBoxSync({
      message: "Microsoft Edge not found.\nOpen in default browser?",

      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      cancelId: 1,
      title: "Confirm Action",
    });

    if (result === 0) {
      shell.openExternal(url);
    }

    return;
  }

  exec(`"${msedgePath}" "${url}"`, (error) => {
    if (error) throw error;
  });
}

function createLastPlayedDir(): string {
  const lastPlayedDir = "./resources/last-played";

  if (!fs.existsSync(lastPlayedDir)) {
    fs.mkdir(lastPlayedDir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  return lastPlayedDir;
}
