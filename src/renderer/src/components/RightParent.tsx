import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useContext, useRef, useState } from "react";
import { AppContext } from "@renderer/contexts/AppContext";
import Loader from "./Loader";

const route = getRouteApi("/");

function RightParent(props: { className: string }): JSX.Element {
  const [loading, setLoading] = useState<Boolean>(false);

  const {
    activeDirectory,
    pdfsList,
    lastPlayed,
    setLastPlayed,
    lastViewed,
    setCurrentUserId,
  } = useContext(AppContext);

  const [dbUserList, setDbUserList] = useState<dbUser[]>([]);
  const [userNameToAdd, setUserNameToAdd] = useState<dbUser["NAME"]>("");

  const userLastPlayedDialogRef = useRef<HTMLDialogElement>(null);

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

  const getUsers = async () => {
    const getUsers: dbUser[] = await window.api.dbGetUsers();
    setDbUserList(getUsers);
  };
  const getUsersLoader = async () => {
    setLoading(true);
    await getUsers();
    setLoading(false);
  };

  const handleGetUsers = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    setUserNameToAdd("");
    userLastPlayedDialogRef.current?.showModal();
    await getUsersLoader();
  };

  const outsideClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = userLastPlayedDialogRef.current;
    if (dialog && event.target === dialog) {
      dialog.close();
    }
  };

  const handleGetUserLastPlayed = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    userId: dbUserLastPlayed["ID"],
  ) => {
    event.preventDefault();
    setLoading(true);

    const lastPlayed: dbUserLastPlayed =
      await window.api.dbGetUserLastPlayed(userId);
    setLastPlayed(lastPlayed.LAST_PLAYED);
    setCurrentUserId(userId);

    const dialog = userLastPlayedDialogRef.current;
    dialog?.close();
    setLoading(false);
  };

  const handleAddUser = async () => {
    if (userNameToAdd === "" || !userNameToAdd.trim()) return;
    setLoading(true);

    await window.api.dbAddUser(userNameToAdd);
    await getUsers();

    setUserNameToAdd("");
    setLoading(false);
  };

  const handleDeleteUser = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    userId: dbUser["ID"],
  ) => {
    event.preventDefault();

    setLoading(true);
    const isDeleted: boolean = await window.api.dbDeleteUser(userId);
    if (!isDeleted) {
      setLoading(false);
      return;
    }

    await getUsers();
    setLoading(false);
  };

  return (
    <div id="pdfs-list" className={props.className}>
      <dialog
        ref={userLastPlayedDialogRef}
        onClick={(event) => outsideClick(event)}
        className="min-w-[280px] max-w-[580px] w-2/5 h-1/3 border-solid border-2 border-black bg-gray-200 rounded-md"
      >
        <div className="p-4 w-full h-full max-h-full overflow-y-auto">
          <div className="flex justify-between items-center gap-2">
            <input
              type="text"
              className="h-8"
              value={userNameToAdd}
              onChange={(e) => setUserNameToAdd(e.target.value)}
              placeholder="Type user name to add..."
            />
            <button className="w-32" onClick={handleAddUser}>
              Add User
            </button>
          </div>
          {loading && <Loader />}
          {!loading && (
            <ul className="w-full divide-y divide-black text-black">
              {dbUserList.map((value, index) => (
                <li key={`ch-${index}`} className="p-1 flex justify-between">
                  <a
                    href="#"
                    key={"user-" + value.ID}
                    onClick={(event) =>
                      handleGetUserLastPlayed(event, value.ID)
                    }
                  >
                    {value.NAME}
                  </a>
                  <a
                    href="#"
                    key={"delete-user-" + value.ID}
                    onClick={(event) => handleDeleteUser(event, value.ID)}
                  >
                    <i className="fas fa-trash text-xl" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>

      <div className={`flex flex-col ${activeDirectory ? "" : "hidden"}`}>
        <pre
          id="current-folder-info"
          className="px-6 text-center overflow-ellipsis overflow-x-hidden"
        >
          <span className="whitespace-nowrap">{activeDirectory}</span>
          <div className="text-nowrap flex flex-row justify-center">
            <span>Latest: </span>
            <a
              href="#"
              className="overflow-ellipsis overflow-x-hidden"
              onClick={(event) => scrollTo(event, lastPlayed!)}
            >
              {lastPlayed || "<none>"}
            </a>
            <span className="mx-2">|</span>
            <a href="#" onClick={(event) => handleGetUsers(event)}>
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
    currentUserId,
    setPdfsList,
    setLastViewed,
    setLastPlayed,
  } = useContext(AppContext);

  const { pdfName } = route.useSearch();

  // const handleSaveLastPlayed = async (
  //   event: React.MouseEvent<HTMLAnchorElement>,
  //   fileName: string | null,
  //   data: string,
  // ) => {
  //   event.preventDefault();

  //   const isSaved = await window.api.saveLastPlayedAsync(fileName, data);
  //   if (isSaved) setLastPlayed(data);
  // };

  const handleDbSaveLastPlayed = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    lastPlayed: dbUserLastPlayed["LAST_PLAYED"],
  ) => {
    event.preventDefault();

    const userId = currentUserId?.valueOf() as dbUserLastPlayed["ID"];
    const isSaved = await window.api.dbSaveLastPlayedAsync(userId, lastPlayed);
    if (isSaved) setLastPlayed(lastPlayed);
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

    // setTimeout(() => {
    //   window.api.fileYTSearch(fileName!);
    // }, 1000);
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
  //max-h-[76vh]
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
              <div className="pl-10 my-1 whitespace-nowrap">
                <Link
                  to="/view/$path"
                  params={{ path: activeDirectory + "\\" + value }}
                  className="mr-4"
                  title="Open PDF"
                  onClick={() => openPdfOnClick(value)}
                >
                  <i className="fas fa-file-pdf text-xl" />
                </Link>
                {/* <a
                  href="#"
                  className="mr-4"
                  title="Save Last Played"
                  onClick={(event) => handleSaveLastPlayed(event, null, value)}
                >
                  <i className="fas fa-floppy-disk text-xl" />
                </a> */}
                <a
                  href="#"
                  className="mr-4"
                  title="Save Last Played"
                  onClick={(event) => handleDbSaveLastPlayed(event, value)}
                >
                  <i className="fas fa-floppy-disk text-xl" />
                </a>
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
