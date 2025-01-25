import { createFileRoute, Await, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import ViewPdf from "@renderer/components/ViewPdf";

export const Route = createFileRoute("/view/$path")({
  loader: async ({ params }) => {
    try {
      const newPath = decodeURIComponent(params.path);
      const pdfSlow = getPdfSlow(newPath);

      const fileName = returnString(newPath);

      return { pdfUrl: pdfSlow, pdfFileName: fileName };
    } catch (error) {
      throw error;
    }
  },
  component: ViewPdf,
});

async function getPdfSlow(path: string) {
  const base64 = await window.api.getPdfFile(path);
  return new Promise<string>((resolve) => {
    resolve(`data:application/pdf;base64,${base64}`);
  });
}

async function returnString(param: string) {
  return new Promise<string>((resolve) => {
    resolve(param);
  });
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

  return (
    <div className="w-full max-h-screen flex flex-col place-items-center">
      <nav className="sticky bg-gray-200 shadow shadow-gray-300 w-full text-black flex items-center justify-between">
        <Await promise={pdfFileName} fallback="loading...">
          {(data) => {
            return (
              <div>
                <a href="#" onClick={(event) => handleOpenFile(event, data)}>
                  <span className="px-2">
                    {data.split("\\").pop() ?? "<none>"}
                  </span>
                </a>
                <span className="px-1 text-xs font-bold italic">
                  {`Click if no PDF displayed`}
                </span>
              </div>
            );
          }}
        </Await>

        <Link to="/" className="text-black mr-1" title="Go Back">
          <i className="fa fa-xmark text-3xl px-1 my-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-blue-700 " />
        </Link>
      </nav>

      <div className="w-full pl-2 pr-4 max-h-screen overflow-y-auto bg-gray-400">
        <Await promise={pdfUrl} fallback="loading...">
          {(data) => {
            return (
              <>
                <embed
                  src={`${data}#toolbar=0&view=FitH`}
                  itemType="application/pdf"
                  className="p-2 w-full"
                  style={{
                    height: `${Math.floor(windowSize.height * 0.95)}px`,
                  }}
                ></embed>

                {/* <iframe
                  src={`${data}#toolbar=0&view=FitH`}
                  itemType="application/pdf"
                  className="p-2 w-full"
                  style={{
                    height: `${Math.floor(windowSize.height * 0.95)}px`,
                  }}
                ></iframe> */}
              </>
            );
          }}
        </Await>
      </div>
    </div>
  );
}
