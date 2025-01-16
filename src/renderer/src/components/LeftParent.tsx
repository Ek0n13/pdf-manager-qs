import { useState, useRef } from "react";

function LeftParent(props: {
  className: string;
  setActiveDirectory: React.Dispatch<React.SetStateAction<string | null>>;
  setPdfsList: React.Dispatch<React.SetStateAction<string[]>>;
}): JSX.Element {
  const [parentDirectory, setParentDirectory] = useState<string | null>("");
  const [childrenDirectories, setChildrenDirectories] = useState<string[]>([]);
  const [parentFolder, setParentFolder] = useState<string | undefined>("");
  const snapshotChildren = useRef<string[]>([]);

  const handleDirectoryDialog = async () => {
    const dir = await window.api.directoryDialog();

    if (!dir) {
      props.setPdfsList([]);
      props.setActiveDirectory(null);

      setChildrenDirectories([]);
      setParentDirectory(null);
      setParentFolder("");

      return;
    }

    setParentDirectory(dir);
    setParentFolder(dir?.split("\\").splice(-1)[0]);
  };

  const handleGetChildDirectories = async () => {
    const children = await window.api.getChildDirectories(parentDirectory!);

    if (!children) return;

    // ** REMOVE THIS **
    const x: string[] = Array(1).fill(children).flat();
    // ** REMOVE THIS **

    snapshotChildren.current = x;
    setChildrenDirectories(x);
  };

  const liveSearch = (inputValue: string) => {
    if (inputValue === "" || inputValue === null) {
      setChildrenDirectories(snapshotChildren.current);
      return;
    }

    const filteredPdfList = snapshotChildren.current.filter((item) =>
      item.toLowerCase().includes(inputValue.toLowerCase()),
    );
    setChildrenDirectories(filteredPdfList);
  };

  return (
    <div id="left-side" className={props.className}>
      <div id="buttons" className="flex justify-center">
        <button onClick={handleDirectoryDialog}>Choose Folder</button>
        <button
          disabled={parentDirectory === null || parentDirectory === ""}
          className="disabled:pointer-events-none disabled:opacity-30"
          onClick={handleGetChildDirectories}
        >
          Get Sub Folders
        </button>
      </div>
      <div id="list-parent" className={parentDirectory ? "" : " hidden"}>
        <pre className="text-center">{"Parent Folder: " + parentFolder}</pre>
        <input
          type="search"
          placeholder="Search..."
          onInput={(event) => liveSearch(event.currentTarget.value)}
        />
        <DirectoriesList
          setActiveDirectory={props.setActiveDirectory}
          setPdfsList={props.setPdfsList}
          parentDirectory={parentDirectory}
          childrenDirectories={childrenDirectories}
        />
      </div>
    </div>
  );
}

function DirectoriesList(props: {
  setActiveDirectory: React.Dispatch<React.SetStateAction<string | null>>;
  setPdfsList: React.Dispatch<React.SetStateAction<string[]>>;
  parentDirectory: string | null;
  childrenDirectories: string[];
}) {
  const handleDirectoryRead = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    folder: string,
  ) => {
    event.preventDefault();

    const activeDir = await window.api.joinPaths(
      props.parentDirectory!,
      folder,
    );
    props.setActiveDirectory(activeDir);

    const fileList = await window.api.readDirectory(activeDir!);

    // ** REMOVE THIS **
    const x: string[] = Array(1).fill(fileList).flat();
    // ** REMOVE THIS **

    props.setPdfsList(x);
  };

  return (
    <div>
      <ul className="divide-y text-black max-h-[78vh] overflow-y-auto">
        {props.childrenDirectories.map((value, index) => (
          <li
            key={index}
            className="mx-4 pr-4 whitespace-nowrap overflow-ellipsis overflow-x-hidden"
          >
            <a href="#" onClick={(event) => handleDirectoryRead(event, value)}>
              {value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeftParent;
