import { createFileRoute, Await, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { youtube_v3 } from "googleapis";

export const Route = createFileRoute("/view/$path")({
  loader: async ({ params }) => {
    try {
      const newPath = decodeURIComponent(params.path);
      const pdfSlow = getPdfSlow(newPath);

      const fileName = returnString(newPath);

      // use the results from loader by querying the fileName
      // const yt = youtubeSearchResults(filename);

      return { pdfUrl: pdfSlow, pdfFileName: fileName };
    } catch (error) {
      throw error;
    }
  },
  component: ViewPdf,
});

async function getPdfSlow(path: string) {
  const buffer: Buffer = await window.api.getPdfFile(path);
  const blob = new Blob([buffer], {type: "application/pdf"});
  const url = window.URL.createObjectURL(blob);

  return new Promise<string>((resolve) => {
    resolve(url)
  });
}

async function returnString(param: string) {
  return new Promise<string>((resolve) => {
    resolve(param);
  });
}

async function youtubeSearchResults(query: string) {
  const ytResults = await window.api.youtubeSearchResults(query);

  return new Promise<Array<youtube_v3.Schema$SearchResult> | undefined>((resolve) => {
    resolve(ytResults);
  })
}

function ViewPdf(): JSX.Element {
  const { pdfUrl, pdfFileName } = Route.useLoaderData();

  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  });

  const handleOpenFile = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    event.preventDefault();

    window.api.openFile(path, null);
  };

  const handleShowModal = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const ytResults = await window.api.youtubeSearchResults("subtact step up");
    console.log(ytResults);

    const element = document.getElementById("youtube-search-modal");
    element?.classList.toggle("opacity-0");
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
        <Link to="/" className="text-black mr-1 hover:text-red-600" title="Go Back">
          <i className="fa fa-xmark text-3xl px-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-red-600" />
        </Link>
      </nav>

      <div id="youtube-search-modal" className="opacity-0 bg-gray-200 shadow-xl border-solid border-black border-2">
        <span className="text-black">hello</span>
          {/* <Await promise={ytResults} fallback="loading...">
            {(data) => {
              

              return (
              <>
                <iframe className="absolute top-1 left-1 bg-red-600" src={`https://www.youtube.com/embed/${data![0].id?.videoId}`}></iframe>
              </>
              )
            }}
          </Await> */}
        </div>
      
      <div className="w-full">
        

        <div className="w-full pl-2 pr-4 max-h-screen overflow-y-auto bg-gray-400">
          <Await promise={pdfUrl} fallback="loading...">
            {(data) => {
              return (
                <embed
                  src={`${data}#toolbar=0&view=FitH`}
                  itemType="application/pdf"
                  className="p-2 w-full"
                  style={{
                    height: `${Math.floor(windowSize.height * 0.95)}px`,
                  }}
                ></embed>
              );
            }}
          </Await>
        </div>
      </div>
    </div>
  );
}
