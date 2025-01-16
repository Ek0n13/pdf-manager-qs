import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      joinPaths: (...paths: string[]) => Promise<string | null>;

      readTextFile: (filePath: string | null) => Promise<string | null>;
      readDirectory: (directory: string) => Promise<string[]>;
      directoryDialog: () => Promise<string | null>;
      getChildDirectories: (directory: string) => Promise<string[]>;

      openFile: (filePath: string, directory: string) => void;
      fileYTSearch: (fileString: string) => void;
      saveLastPlayed: (fileName: string | null, data: string) => void;

      getPdfFile: (path: string) => Promise<string>;
    };
  }
}
