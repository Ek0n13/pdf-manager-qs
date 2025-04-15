import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
  joinPaths: (...paths: string[]) => ipcRenderer.invoke("join-paths", ...paths),

  readDirectory: (directory: string) =>
    ipcRenderer.invoke("read-directory", directory),
  directoryDialog: () => ipcRenderer.invoke("directory-dialog"),
  getChildDirectories: (directory: string) =>
    ipcRenderer.invoke("get-child-directories", directory),

  openFile: (fileName: string, directory: string | null) =>
    ipcRenderer.send("open-file", fileName, directory),
  deleteFile: (fileName: string, directory: string) =>
    ipcRenderer.invoke("delete-file", fileName, directory),
  fileYTSearch: (fileName: string) =>
    ipcRenderer.send("file-yt-search", fileName),

  readTextFile: (filePath: string | null) =>
    ipcRenderer.invoke("read-text-file", filePath),
  saveLastPlayed: (fileName: string | null, data: string) =>
    ipcRenderer.send("save-last-played", fileName, data),
  saveLastPlayedAsync: (fileName: string | null, data: string) =>
    ipcRenderer.invoke("save-last-played-async", fileName, data),

  getPdfFile: (path: string) => ipcRenderer.invoke("get-pdf-file", path),

  youtubeSearchResults: (query: string) =>
    ipcRenderer.invoke("youtube-search-results", query),

  dbAddUser: (name: string) => ipcRenderer.send("db-add-user", name),
  dbDeleteUser: (id: number) => ipcRenderer.send("db-delete-user", id),
  dbGetUsers: () => ipcRenderer.invoke("db-get-users"),
  dbAddUserLastPlayed: (userId: number, lastPlayed: string) =>
    ipcRenderer.send("db-add-user-last-played", userId, lastPlayed),
  dbGetUserLastPlayed: (id: number) =>
    ipcRenderer.invoke("db-get-user-last-played", id),
  dbSaveLastPlayedAsync: (userId: number | null, lastPlayed: string) =>
    ipcRenderer.invoke("db-save-last-played-async", userId, lastPlayed),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
