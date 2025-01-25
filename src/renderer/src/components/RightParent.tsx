import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useContext } from "react";
import { AppContext } from "@renderer/contexts/AppContext";

const route = getRouteApi("/");

function RightParent(props: { className: string }): JSX.Element {
  const { activeDirectory, pdfsList, lastPlayed, setLastPlayed, lastViewed } =
    useContext(AppContext);

  const navigate = route.useNavigate();

  useEffect(() => {
    scrollToElement(lastViewed!);
  }, [lastViewed]);

  const scrollToElement = (fileName: string, smooth: boolean = false) => {
    const listItemIndex = pdfsList.findIndex((item) => item === fileName);

    if (listItemIndex < 0) return;

    const element = document.getElementById("item-" + listItemIndex);
    if (smooth) element?.scrollIntoView({ behavior: "smooth", block: "start" });
    else element?.scrollIntoView();

    element?.classList.add("highlight");
  };

  const scrollTo = (
    event: React.MouseEvent<HTMLAnchorElement>,
    fileName: string,
  ) => {
    event.preventDefault();

    scrollToElement(fileName, true);
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
      <div className={`flex flex-col ${activeDirectory ? "" : "hidden"}`}>
        <pre
          id="current-folder-info"
          className="px-6 text-center overflow-ellipsis overflow-x-hidden"
        >
          <span className="whitespace-nowrap">{activeDirectory}</span>
          <div className="text-nowrap">
            <span>Latest: </span>
            <a href="#" onClick={(event) => scrollTo(event, lastPlayed!)}>
              <span className="max-w-4 whitespace-nowrap overflow-ellipsis overflow-x-hidden">
                {lastPlayed || "<none>"}
              </span>
            </a>
            <span className="mx-2">|</span>
            <a href="#" onClick={(event) => handleReadTextFile(event)}>
              <i className="fas fa-download text-lg" />
            </a>
          </div>
        </pre>
        <input
          type="search"
          placeholder="Search..."
          onChange={(event) =>
            navigate({ search: { pdfName: event.target.value } })
          }
        />
        <PdfsList />
      </div>
    </div>
  );
}

function PdfsList() {
  const {
    activeDirectory,
    pdfsList,
    setPdfsList,
    setLastViewed,
    setLastPlayed,
  } = useContext(AppContext);

  const { pdfName } = route.useSearch();

  const handleSaveLastPlayed = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    fileName: string | null,
    data: string,
  ) => {
    event.preventDefault();

    const isSaved = await window.api.saveLastPlayedAsync(fileName, data);
    if (isSaved) setLastPlayed(data);
  };

  // const handleYTSearch = (
  //   event: React.MouseEvent<HTMLInputElement | HTMLAnchorElement>,
  //   fileName: string,
  // ) => {
  //   event.preventDefault();

  //   window.api.fileYTSearch(fileName);
  // };

  const handleDeleteFile = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    fileName: string,
  ) => {
    event.preventDefault();

    const fileDeleted = await window.api.deleteFile(fileName, activeDirectory!);

    if (fileDeleted) {
      const filteredPdfList = pdfsList.filter((item) => {
        return item.toLocaleLowerCase() !== fileName.toLocaleLowerCase();
      });
      setPdfsList(filteredPdfList);
    }
  };

  const openPdfOnClick = (fileName: string | null) => {
    setLastViewed(fileName);

    setTimeout(() => {
      window.api.fileYTSearch(fileName!);
    }, 1000);
  };

  const removeHighlight = () => {
    const highlightedElements = document.getElementsByClassName("highlight");
    if (highlightedElements.length === 0) return;
    if (highlightedElements.length > 1) throw new Error("Higlighting error");
    const element = highlightedElements.item(0);
    setTimeout(() => {
      element?.classList.remove("highlight");
    }, 5000);
  };

  return (
    <div
      className={`max-h-[76vh] overflow-y-scroll ${pdfsList.length === 0 ? "hidden" : ""}`}
      onScroll={removeHighlight}
    >
      <ul className="divide-y divide-black text-black">
        {pdfsList
          .filter((item) =>
            item.toLowerCase().includes(pdfName?.toLowerCase() ?? ""),
          )
          .map((value, index) => (
            <li
              id={"item-" + index}
              key={"open-" + index}
              className="mx-4 px-2 flex justify-between items-center text-black rounded-sm highlightable"
            >
              <span className="overflow-ellipsis overflow-x-hidden whitespace-nowrap">
                {value}
              </span>
              <div className="pl-10 my-1">
                <Link
                  to="/view/$path"
                  params={{ path: activeDirectory + "\\" + value }}
                  className="mr-4"
                  title="Open PDF"
                  onClick={() => openPdfOnClick(value)}
                >
                  <i className="fas fa-file-pdf text-xl" />
                </Link>
                <a
                  href="#"
                  className="mr-4"
                  title="Save Last Played"
                  onClick={(event) => handleSaveLastPlayed(event, null, value)}
                >
                  <i className="fas fa-floppy-disk text-xl" />
                </a>
                {/* <a
                href="#"
                title="Search on YT"
                onClick={(event) => handleYTSearch(event, value)}
              >
                <i className="fa fa-magnifying-glass" />
              </a> */}
                <a
                  href="#"
                  title="Delete File"
                  onClick={(event) => handleDeleteFile(event, value)}
                >
                  <i className="fas fa-trash text-xl" />
                </a>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default RightParent;
