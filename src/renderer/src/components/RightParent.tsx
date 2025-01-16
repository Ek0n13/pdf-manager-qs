import { useState, useRef, useEffect } from "react";

function RightParent(props: {
  className: string;
  activeDirectory: string | null;
  pdfList: string[];
}): JSX.Element {
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  const scrollTo = (
    event: React.MouseEvent<HTMLAnchorElement>,
    fileName: string,
  ) => {
    event.preventDefault();

    const listItemIndex = props.pdfList.findIndex((item) => item === fileName);

    if (listItemIndex < 0) return;

    const element = document.getElementById("item-" + listItemIndex);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReadTextFile = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    const content = await window.api.readTextFile(null);
    setLastPlayed(content);
  };

  return (
    <div id="pdfs-list" className={props.className}>
      <div className={props.activeDirectory ? "" : " hidden"}>
        <pre className="px-6 text-center overflow-ellipsis overflow-x-hidden">
          <span className="whitespace-nowrap ">{props.activeDirectory}</span>
          <br />
          Latest:{" "}
          <a href="#" onClick={(event) => scrollTo(event, lastPlayed!)}>
            {lastPlayed || "<none>"}
          </a>
          <span className="mx-2">|</span>
          <a href="#" onClick={(event) => handleReadTextFile(event)}>
            <i className="fas fa-download" />
          </a>
        </pre>
        <PdfsList
          activeDirectory={props.activeDirectory}
          pdfList={props.pdfList}
        />
      </div>
    </div>
  );
}

function PdfsList(props: {
  activeDirectory: string | null;
  pdfList: string[];
}) {
  const [displayPdfList, setDisplayPdfList] = useState<string[]>([]);
  const snapshotPdfList = useRef<string[]>([]);

  useEffect(() => {
    snapshotPdfList.current = props.pdfList;
    setDisplayPdfList(props.pdfList);
  }, [props.pdfList]);

  const liveSearch = (inputValue: string) => {
    if (inputValue === "" || inputValue === null) {
      setDisplayPdfList(snapshotPdfList.current);
      return;
    }

    const filteredPdfList = snapshotPdfList.current.filter((item) =>
      item.toLowerCase().includes(inputValue.toLowerCase()),
    );
    setDisplayPdfList(filteredPdfList);
  };

  const handleOpenFile = (
    event: React.MouseEvent<HTMLInputElement | HTMLAnchorElement>,
    fileName: string,
  ) => {
    event.preventDefault();

    window.api.openFile(fileName, props.activeDirectory!);
  };

  const handleYTSearch = (
    event: React.MouseEvent<HTMLInputElement | HTMLAnchorElement>,
    fileString: string,
  ) => {
    event.preventDefault();

    window.api.fileYTSearch(fileString);
  };

  const handleSaveLastPlayed = (
    event: React.MouseEvent<HTMLInputElement | HTMLAnchorElement>,
    fileName: string | null,
    data: string,
  ) => {
    event.preventDefault();

    window.api.saveLastPlayed(fileName, data);
  };

  return (
    <div
      id="pdf-list-search"
      className={props.pdfList.length === 0 ? "hidden" : ""}
    >
      <input
        type="search"
        placeholder="Search..."
        onInput={(event) => liveSearch(event.currentTarget.value)}
      />
      <ul className="divide-y text-black max-h-[81vh] overflow-y-auto">
        {displayPdfList.map((value, index) => (
          <li
            id={"item-" + index}
            key={"open-" + index}
            className="mx-4 px-2 flex justify-between items-center text-black"
          >
            <span className="overflow-ellipsis overflow-x-hidden">{value}</span>
            <div className="pl-10 my-1 flex">
              <a
                href="#"
                className="mr-4"
                onClick={(event) => handleSaveLastPlayed(event, null, value)}
              >
                <i className="far fa-floppy-disk" />
              </a>
              <a
                href="#"
                className="mr-4"
                onClick={(event) => handleOpenFile(event, value)}
              >
                <i className="far fa-file-pdf" />
              </a>
              <a href="#" onClick={(event) => handleYTSearch(event, value)}>
                <i className="fa fa-magnifying-glass" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RightParent;
