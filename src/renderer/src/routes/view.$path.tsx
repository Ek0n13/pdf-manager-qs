import { createFileRoute, Await, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { youtube_v3 } from "googleapis";

export const Route = createFileRoute("/view/$path")({
  loader: async ({ params }) => {
    try {
      const newPath = decodeURIComponent(params.path);

      const url = getPdfUrl(newPath);
      const fileName = getFileName(newPath);
      const results = getYtResults(newPath);

      return { pdfUrl: url, pdfFileName: fileName, ytResults: results };
    } catch (error) {
      throw error;
    }
  },
  component: ViewPdf,
});

async function getPdfUrl(path: string) {
  const buffer: Buffer = await window.api.getPdfFile(path);
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  return new Promise<string>((resolve) => {
    resolve(url);
  });
}

async function getFileName(param: string) {
  return new Promise<string>((resolve) => {
    resolve(param);
  });
}

async function getYtResults(query: string) {
  const ytResults = await window.api.youtubeSearchResults(query);

  return new Promise<Array<youtube_v3.Schema$Video> | undefined>((resolve) => {
    resolve(ytResults);
  });
}

function ViewPdf(): JSX.Element {
  const { pdfUrl, pdfFileName, ytResults } = Route.useLoaderData();

  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        event.target instanceof Node &&
        !modalRef.current.contains(event.target)
      ) {
        setIsModalOpen(false);

        setTimeout(() => {
          if (!modalRef.current) return;
          if (!modalRef.current.classList.contains("opacity-0")) {
            modalRef.current.classList.add("opacity-0");
          }
        });
      }
    };

    window.addEventListener("resize", handleResize);

    if (isModalOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleOpenFile = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    event.preventDefault();

    window.api.openFile(path, null);
  };

  const handleShowModal = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    setIsModalOpen((prev) => !prev);

    setTimeout(() => {
      if (!modalRef.current) return;
      modalRef.current.classList.toggle("opacity-0");
    });
  };

  const handleGoToVideo = (
    event: React.MouseEvent<HTMLAnchorElement>,
    videoId: string,
  ) => {
    event?.preventDefault();

    const ytLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    setFrameSource(ytLink);
    switchResultsVideo();
  };

  const handleGoToResults = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    switchResultsVideo();
    setFrameSource();
  };

  function formatDuration(isoDuration: string): string {
    if (!isoDuration || isoDuration === "null") return "<error>";

    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "<error>";

    const hh = String(match[1] || 0).padStart(2, "0");
    const mm = String(match[2] || 0).padStart(2, "0");
    const ss = String(match[3] || 0).padStart(2, "0");

    return `${hh === "00" ? "" : hh + ":"}${mm}:${ss}`;
  }

  function timeAgo(isoDate: string): string {
    if (!isoDate || isoDate === "null") return "<error>";

    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (months < 12) {
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  }

  function switchResultsVideo() {
    const results = document.getElementById("youtube-results-list");
    const video = document.getElementById("youtube-video-container");

    if (!results || !video) return;

    results.classList.toggle("hidden");

    if (results?.classList.contains("hidden")) {
      video.classList.remove("hidden");
      video.classList.add("inline-block");
    } else {
      video.classList.remove("inline-block");
      video.classList.add("hidden");
    }
  }

  function setFrameSource(src: string = "about:blank") {
    if (!iframeRef.current) return;
    iframeRef.current.src = src;
  }

  return (
    <div className="w-full max-h-screen flex flex-col place-items-center">
      <nav className="sticky py-1 bg-gray-200 shadow shadow-gray-300 w-full text-black flex items-center justify-between">
        <div className="flex flex-row divide-x-2 divide-solid divide-slate-400">
          <Await promise={pdfFileName} fallback="loading...">
            {(data) => {
              return (
                <div className="pt-1">
                  <a href="#" onClick={(event) => handleOpenFile(event, data)}>
                    <span className="px-2">
                      {data.split("\\").pop() ?? "<none>"}
                    </span>
                  </a>{" "}
                  <span className="pr-2 text-xs font-bold italic">
                    {`Click if no PDF displayed`}
                  </span>
                </div>
              );
            }}
          </Await>
          <a
            href="#"
            className="px-2 text-black"
            onClick={(event) => handleShowModal(event)}
          >
            <i className="fa-brands fa-youtube text-2xl px-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-blue-700" />
          </a>
        </div>
        <Link
          to="/"
          className="text-black mr-1 hover:text-red-600"
          title="Go Back"
        >
          <i className="fa fa-xmark text-3xl px-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-red-600" />
        </Link>
      </nav>

      <div
        ref={modalRef}
        id="youtube-search-modal"
        className={`${isModalOpen ? "" : "pointer-events-none"} bg-gray-200 shadow-xl border-solid border-black border-2 z-10 opacity-0`}
      >
        {/* <span className="text-black">hello</span> */}
        <Await promise={ytResults} fallback="loading...">
          {(data) => {
            return (
              <>
                <ul
                  id="youtube-results-list"
                  className="max-h-[90vh] w-full overflow-y-auto overflow-x-hidden divide-y divide-black"
                >
                  {data?.map((value, index) => (
                    <li key={`video-${index}`}>
                      <a
                        href="#"
                        className="flex flex-row p-2 font-normal hover:bg-black hover:bg-opacity-20"
                        onClick={(event) =>
                          handleGoToVideo(event, value.id ?? "")
                        }
                      >
                        <div className="relative inline-block">
                          <img
                            src={value.snippet?.thumbnails?.default?.url ?? ""}
                            alt="No thumbnail"
                          />
                          <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-sm px-1 rounded-sm">
                            {formatDuration(
                              value.contentDetails?.duration ?? "",
                            )}
                          </span>
                        </div>
                        <div className="p-2 flex flex-col text-black justify-center">
                          <span>{value.snippet?.title}</span>
                          <span>{`${value.snippet?.channelTitle} • ${timeAgo(value.snippet?.publishedAt ?? "")}`}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            );
          }}
        </Await>
        <div
          id="youtube-video-container"
          className="max-h-[90vh] w-full hidden"
        >
          <a
            href="#"
            className="absolute top-2 left-2 text-black"
            onClick={handleGoToResults}
          >
            <i className="fas fa-arrow-left text-2xl px-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-blue-700" />
          </a>
          <div className="flex items-center justify-center">
            <iframe
              ref={iframeRef}
              className="p-2 w-[93%] h-[28vh]"
              src="about:blank"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="w-full pl-2 pr-4 max-h-screen overflow-y-auto bg-gray-400">
          <Await promise={pdfUrl} fallback="loading...">
            {(data) => {
              return (
                <div className="relative">
                  {isModalOpen && (
                    <div className="absolute inset-0 bg-transparet pointer-events-auto"></div>
                  )}
                  <embed
                    src={`${data}#toolbar=0&view=FitH`}
                    itemType="application/pdf"
                    className="p-2 w-full"
                    style={{
                      height: `${Math.floor(windowSize.height * 0.95)}px`,
                    }}
                  ></embed>
                </div>
              );
            }}
          </Await>
        </div>
      </div>
    </div>
  );
}
