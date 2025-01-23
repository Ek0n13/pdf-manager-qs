import { createContext } from "react";

type LeftParentContextType = {
  parentDirectory: string | null;
  setParentDirectory: React.Dispatch<React.SetStateAction<string | null>>;
  childrenDirectories: string[];
  setChildrenDirectories: React.Dispatch<React.SetStateAction<string[]>>;
  parentFolder: string | undefined;
  setParentFolder: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type RightParentContextType = {
  lastPlayed: string | null;
  setLastPlayed: React.Dispatch<React.SetStateAction<string | null>>;
  lastViewed: string | null;
  setLastViewed: React.Dispatch<React.SetStateAction<string | null>>;
};

type AppContextType = {
  activeDirectory: string | null;
  setActiveDirectory: React.Dispatch<React.SetStateAction<string | null>>;
  pdfsList: string[];
  setPdfsList: React.Dispatch<React.SetStateAction<string[]>>;
} & LeftParentContextType &
  RightParentContextType;

export const AppContext = createContext({} as AppContextType);
