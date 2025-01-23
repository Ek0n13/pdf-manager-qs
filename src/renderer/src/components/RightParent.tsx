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

    setTimeout(() => {
      element?.classList.add("highlight");
    }, 250);

    setTimeout(() => {
      element?.classList.remove("highlight");
    }, 2000);
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
      <div className={activeDirectory ? "" : " hidden"}>
        <div className="sticky top-0">
          <pre
            id="current-folder-info"
            className="px-6 text-center overflow-ellipsis overflow-x-hidden"
          >
            <span className="whitespace-nowrap ">{activeDirectory}</span>
            <br />
            Latest:{" "}
            <a href="#" onClick={(event) => scrollTo(event, lastPlayed!)}>
              {lastPlayed || "<none>"}
            </a>
            <span className="mx-2">|</span>
            <a href="#" onClick={(event) => handleReadTextFile(event)}>
              <i className="fas fa-download text-lg" />
            </a>
          </pre>
          <input
            type="search"
            placeholder="Search..."
            onChange={(event) =>
              navigate({ search: { pdfName: event.target.value } })
            }
          />
        </div>
        <PdfsList />
      </div>
    </div>
  );
}

function PdfsList() {
  const { activeDirectory, pdfsList, setPdfsList, setLastViewed } =
    useContext(AppContext);

  const { pdfName } = route.useSearch();

  const handleSaveLastPlayed = (
    event: React.MouseEvent<HTMLAnchorElement>,
    fileName: string | null,
    data: string,
  ) => {
    event.preventDefault();

    window.api.saveLastPlayed(fileName, data);
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

  return (
    <div className={`${pdfsList.length === 0 ? "hidden" : ""}`}>
      <ul className="divide-y divide-black text-black max-h-[80vh] overflow-y-scroll">
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
              <span className="overflow-ellipsis overflow-x-hidden">
                {value}
              </span>
              <div className="pl-10 my-1 flex">
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
