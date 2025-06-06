import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { User, UserLastPlayed, FileBlobs } from "../main/oracle-client.js";

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

  // context menu
  showContextMenu: () => ipcRenderer.send("show-context-menu"),

  dbAddUser: (name: User["NAME"]): Promise<void> =>
    ipcRenderer.invoke("db-add-user", name),
  dbDeleteUser: (id: User["ID"]): Promise<boolean> =>
    ipcRenderer.invoke("db-delete-user", id),
  dbGetUsers: (): Promise<User[] | undefined> =>
    ipcRenderer.invoke("db-get-users"),
  dbSaveLastPlayedAsync: (
    userId: UserLastPlayed["ID"],
    lastPlayed: UserLastPlayed["LAST_PLAYED"],
  ): Promise<boolean> =>
    ipcRenderer.invoke("db-save-last-played-async", userId, lastPlayed),
  dbGetUserLastPlayed: (
    id: UserLastPlayed["ID"],
  ): Promise<UserLastPlayed | undefined> =>
    ipcRenderer.invoke("db-get-user-last-played", id),
  dbUploadFile: (
    fileName: FileBlobs["FILE_NAME"],
    blobData: FileBlobs["BLOB_DATA"],
  ): Promise<void> => ipcRenderer.invoke("db-upload-file", fileName, blobData),
  dbGetFileBlobData: (
    fileName: FileBlobs["FILE_NAME"],
  ): Promise<FileBlobs["BLOB_DATA"] | undefined> =>
    ipcRenderer.invoke("db-get-file-blob-data", fileName),
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
