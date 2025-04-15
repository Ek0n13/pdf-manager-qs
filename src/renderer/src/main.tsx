import { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import "./assets/main.css";

import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { AppContext } from "@renderer/contexts/AppContext";

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});

// Create a new router instance
const router = createRouter({
  routeTree,
  history: memoryHistory,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RootRender />);
}

function RootRender(): React.ReactNode {
  const [activeDirectory, setActiveDirectory] = useState<string | null>("");
  const [pdfsList, setPdfsList] = useState<string[]>([]);

  //Left Parent
  const [parentDirectory, setParentDirectory] = useState<string | null>("");
  const [childrenDirectories, setChildrenDirectories] = useState<string[]>([]);
  const [parentFolder, setParentFolder] = useState<string | undefined>("");

  //Right Parent
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<dbUser["ID"] | null>(null);

  const appContext = {
    activeDirectory,
    setActiveDirectory,
    pdfsList,
    setPdfsList,

    parentDirectory,
    setParentDirectory,
    childrenDirectories,
    setChildrenDirectories,
    parentFolder,
    setParentFolder,

    lastPlayed,
    setLastPlayed,
    lastViewed,
    setLastViewed,

    currentUserId,
    setCurrentUserId,
  };

  return (
    <StrictMode>
      <AppContext.Provider value={appContext}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    </StrictMode>
  );
}
