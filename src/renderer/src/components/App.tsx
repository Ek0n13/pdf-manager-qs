import { useState } from "react";
import LeftParent from "./LeftParent";
import RightParent from "./RightParent";

function App() {
  const [activeDirectory, setActiveDirectory] = useState<string | null>("");
  const [pdfsList, setPdfsList] = useState<string[]>([]);

  return (
    <div
      id="main-container"
      className="p-4 grid grid-cols-6 gap-2 leading-8 h-screen"
    >
      <LeftParent
        className="p-4 w-full h-full bg-gray-200 col-span-2 rounded-md"
        setActiveDirectory={setActiveDirectory}
        setPdfsList={setPdfsList}
      />
      <RightParent
        className="p-4 w-full h-full bg-gray-200 col-span-4 rounded-md"
        activeDirectory={activeDirectory}
        pdfList={pdfsList}
      />
    </div>
  );
}

export default App;
