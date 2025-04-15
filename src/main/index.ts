import { app, shell, BrowserWindow, ipcMain, screen, dialog } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { join as pathJoin, parse as pathParse } from "path";
import { exec } from "child_process";
import * as fs from "fs";
import { google, youtube_v3 } from "googleapis";
import * as db from "./oracle-client.js";

import icon from "../../resources/icon.png?asset";

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const cWidth: number = Math.ceil(width * 0.9);
  const cHeight: number = Math.ceil(height * 0.9);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: cWidth,
    height: cHeight,
    // width: 1280,
    // height: 1024,
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
    mainWindow.maximize();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}`);
  } else {
    mainWindow.loadFile(pathJoin(__dirname, `../renderer/index.html`));
  }

  mainWindow.on("close", (event) => {
    // const dialogResult = dialog.showOpenDialogSync({
    //   type: "question",
    //   buttons: ["Yes", "No"],
    //   title: "Confirm",
    //   message: "Are you sure you want to quit?",
    // });

    const dialogResult = dialog.showMessageBoxSync({
      message: "Are you sure you want to quit?",

      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      cancelId: 1,
      title: "Confirm",
    });
    if (dialogResult !== 0) {
      event.preventDefault();
    }
  });
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

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle("join-paths", async (_event, ...paths: string[]) => {
    try {
      return pathJoin(...paths);
    } catch (error) {
      throw new Error("Error joining paths: " + error);
    }
  });

  ipcMain.handle("read-directory", async (_event, directory: string) => {
    try {
      const files = fs.readdirSync(directory);
      return files.filter((file) => file.endsWith(".pdf"));
    } catch (error) {
      throw new Error("Error reading directory:" + error);
    }
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
      throw new Error("Error reading directory: " + error);
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
      throw new Error("Error finding child directories:" + error);
    }
  });

  ipcMain.on(
    "open-file",
    (_event, fileName: string, directory: string | null) => {
      const fullPath =
        directory === null ? fileName : pathJoin(directory, fileName);

      shell.openPath(fullPath).catch((err) => {
        throw new Error("Error opening file:" + err);
      });
    },
  );

  ipcMain.handle(
    "delete-file",
    (_event, fileName: string, directory: string) => {
      try {
        return deleteFile(fileName, directory);
      } catch (error) {
        throw new Error("Error deleting file: " + error);
      }
    },
  );

  ipcMain.on("file-yt-search", (_event, fileName: string) => {
    const searchString = createSearchString(fileName, "+");
    const finalUrl = `https://www.youtube.com/results?search_query=${searchString}+hq`;
    openInEdge(finalUrl);
  });

  ipcMain.handle("read-text-file", async (_event, filePath: string | null) => {
    const file = pathJoin(createLastPlayedDir(), filePath || "tattos.txt");

    try {
      if (!fs.existsSync(file)) {
        dialog.showMessageBoxSync({
          message: "File does not exist.",

          type: "error",
          title: "Error!",
        });

        return null;
      }

      return fs.readFileSync(file, "utf-8");
    } catch (error) {
      throw new Error("Error reading file: " + error);
    }
  });

  ipcMain.on(
    "save-last-played",
    (_event, fileName: string | null, data: string) => {
      try {
        saveLastPlayed(fileName, data);
      } catch (error) {
        throw new Error("Error saving last played: " + error);
      }
    },
  );

  ipcMain.handle(
    "save-last-played-async",
    async (_event, fileName: string | null, data: string) => {
      try {
        return saveLastPlayed(fileName, data);
      } catch (error) {
        throw new Error("Error saving last played: " + error);
      }
    },
  );

  ipcMain.handle("get-pdf-file", async (_event, path) => {
    try {
      const buffer = fs.readFileSync(path);
      return buffer;
    } catch (error) {
      throw new Error("Error getting pdf file: " + error);
    }
  });

  ipcMain.handle("youtube-search-results", async (_event, fileName) => {
    try {
      const query = `${createSearchString(fileName, " ")} hq`;
      const response = await youtubeSearchResults(query);
      return response;
    } catch (error) {
      throw new Error("Error getting youtube search results: " + error);
    }
  });

  // db related funcs
  ipcMain.on("db-add-user", async (_event, name) => {
    try {
      db.addUser(name);
    } catch (error) {
      throw new Error("Error adding user: " + error);
    }
  });

  ipcMain.on("db-delete-user", async (_event, id) => {
    try {
      db.deleteUser(id);
    } catch (error) {
      throw new Error("Error deleting user: " + error);
    }
  });

  ipcMain.handle("db-get-users", async (_event) => {
    try {
      return db.getUsers();
    } catch (error) {
      throw new Error("Error getting users: " + error);
    }
  });

  ipcMain.on("db-add-user-last-played", async (_event, userId, lastPlayed) => {
    try {
      db.addUserLastPlayed(userId, lastPlayed);
    } catch (error) {
      throw new Error("Error adding user: " + error);
    }
  });

  ipcMain.handle("db-get-user-last-played", async (_event, id) => {
    try {
      return db.getUserLastPlayed(id);
    } catch (error) {
      throw new Error("Error getting users: " + error);
    }
  });

  ipcMain.handle(
    "db-save-last-played-async",
    async (_event, userId: number | null, lastPlayed: string) => {
      try {
        return dbSaveLastPlayed(userId, lastPlayed);
      } catch (error) {
        throw new Error("Error saving last played (db): " + error);
      }
    },
  );
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
function createSearchString(fileName: string, delimiter: string): string {
  const strippedFileName = pathParse(fileName).name.trim();

  const searchString = strippedFileName
    .replace(/&/g, "%26")
    .replace(/\'/g, "")
    .replace(/\"/g, "")
    .replace(/ /g, delimiter)
    .trim();

  return searchString;
}

function saveLastPlayed(fileName: string | null, data: string): boolean {
  const file = pathJoin(createLastPlayedDir(), fileName || "tattos.txt");

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
    return true;
  }

  return false;
}

function dbSaveLastPlayed(userId: number | null, lastPlayed: string): boolean {
  if (!userId) {
    dialog.showMessageBoxSync({
      message: "Select current user first.",

      type: "error",
      title: "Error!",
    });

    return false;
  }

  const result = dialog.showMessageBoxSync({
    message: "Save last played?",

    type: "question",
    buttons: ["Yes", "No"],
    defaultId: 0,
    cancelId: 1,
    title: "Confirm Action",
  });

  if (result === 0) {
    db.addUserLastPlayed(userId, lastPlayed);
    return true;
  }

  return false;
}

function deleteFile(fileName: string, directory: string): boolean {
  const fullPath = pathJoin(directory, fileName);

  const fileExists = fs.existsSync(fullPath);
  const isFile = fs.statSync(fullPath).isFile();

  if (!fileExists) {
    dialog.showMessageBoxSync({
      message: "File does not exist.",

      type: "error",
      title: "Error!",
    });

    return false;
  }

  if (!isFile) {
    dialog.showMessageBoxSync({
      message: "Path is not a file.",

      type: "error",
      title: "Error!",
    });

    return false;
  }

  const result = dialog.showMessageBoxSync({
    message: `Delete file: "${fileName}"?`,

    type: "warning",
    buttons: ["Yes", "No"],
    defaultId: 0,
    cancelId: 1,
    title: "Warning!",
  });

  if (result === 0) {
    // fs.rmSync(fullPath);
    shell.trashItem(fullPath);
    return true;
  }

  return false;
}

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

async function youtubeSearchResults(
  query: string,
): Promise<Array<youtube_v3.Schema$Video> | undefined> {
  const youtube = google.youtube({
    version: "v3",
    auth: import.meta.env["VITE_YOUTUBE_API_KEY"],
  });

  const response = await youtube.search.list({
    part: ["snippet"],
    q: query,
    maxResults: 10,
    type: ["video"],
    videoEmbeddable: "true",
  });

  const videoList = await youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: response.data.items?.map((value) => value.id?.videoId ?? ""),
  });

  return videoList.data.items;
}
