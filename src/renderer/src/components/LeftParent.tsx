import { useContext } from "react";
import { AppContext } from "@renderer/contexts/AppContext";
import { getRouteApi } from "@tanstack/react-router";

const route = getRouteApi("/");

function LeftParent(props: { className: string }): JSX.Element {
  const {
    setActiveDirectory,
    setPdfsList,

    parentDirectory,
    setParentDirectory,
    // childrenDirectories,
    setChildrenDirectories,
    parentFolder,
    setParentFolder,
  } = useContext(AppContext);

  const navigate = route.useNavigate();
  // const snapshotChildren = useRef<string[]>([]);

  const handleDirectoryDialog = async () => {
    const dir = await window.api.directoryDialog();

    if (!dir) {
      setPdfsList([]);
      setActiveDirectory(null);

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
    const x: string[] = Array(20).fill(children).flat();
    // ** REMOVE THIS **

    // snapshotChildren.current = x;
    setChildrenDirectories(x);
  };

  // const liveSearch = (inputValue: string) => {
  //   if (inputValue === "" || inputValue === null) {
  //     setChildrenDirectories(snapshotChildren.current);
  //     return;
  //   }

  //   const filteredPdfList = snapshotChildren.current.filter((item) =>
  //     item.toLowerCase().includes(inputValue.toLowerCase()),
  //   );
  //   setChildrenDirectories(filteredPdfList);
  // };

  return (
    <div id="left-side" className={props.className}>
      <div
        className={`sticky top-0 bg-gray-200 ${parentDirectory ? "" : "hidden"}`}
      >
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
        <pre className="text-center">{"Parent Folder: " + parentFolder}</pre>
        <input
          type="search"
          placeholder="Search..."
          onChange={(event) =>
            navigate({ search: { folderName: event.target.value } })
          }
        />
      </div>
      <DirectoriesList />
    </div>
  );
}

function DirectoriesList() {
  const {
    setActiveDirectory,
    setPdfsList,

    parentDirectory,
    childrenDirectories,
  } = useContext(AppContext);

  const { folderName } = route.useSearch();

  const handleDirectoryRead = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    folder: string,
  ) => {
    event.preventDefault();

    const activeDir = await window.api.joinPaths(parentDirectory!, folder);
    setActiveDirectory(activeDir);

    const fileList = await window.api.readDirectory(activeDir!);

    // ** REMOVE THIS **
    const x: string[] = Array(4).fill(fileList).flat();
    // ** REMOVE THIS **

    setPdfsList(x);
  };
  //max-h-[76vh] overflow-y-auto
  return (
    <div>
      <ul className="divide-y divide-black text-black max-h-[76vh] overflow-y-auto">
        {childrenDirectories
          .filter((item) =>
            item.toLowerCase().includes(folderName?.toLowerCase() ?? ""),
          )
          .map((value, index) => (
            <li
              key={index}
              className="mx-4 pr-4 whitespace-nowrap overflow-ellipsis overflow-x-hidden"
            >
              <a
                href="#"
                onClick={(event) => handleDirectoryRead(event, value)}
              >
                {value}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default LeftParent;
