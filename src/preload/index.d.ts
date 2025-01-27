import { ElectronAPI } from "@electron-toolkit/preload";
import { youtube_v3 } from "googleapis";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      joinPaths: (...paths: string[]) => Promise<string | null>;

      readTextFile: (filePath: string | null) => Promise<string | null>;
      readDirectory: (directory: string) => Promise<string[]>;
      directoryDialog: () => Promise<string | null>;
      getChildDirectories: (directory: string) => Promise<string[]>;

      openFile: (filePath: string, directory: string | null) => void;
      deleteFile: (fileName: string, directory: string) => Promise<boolean>;
      fileYTSearch: (fileName: string) => void;
      saveLastPlayed: (fileName: string | null, data: string) => void;
      saveLastPlayedAsync: (
        fileName: string | null,
        data: string,
      ) => Promise<boolean>;

      getPdfFile: (path: string) => Promise<Buffer>;

      youtubeSearchResults: (
        query: string,
      ) => Promise<Array<youtube_v3.Schema$SearchResult> | undefined>;
    };
  }
}
