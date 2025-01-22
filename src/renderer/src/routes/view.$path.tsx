import { createFileRoute, Await, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
// import ViewPdf from "@renderer/components/ViewPdf";

export const Route = createFileRoute('/view/$path')({
  loader: async ({ params }) => {
    try {
      const newPath = decodeURIComponent(params.path);
      const pdfSlow = getPdfSlow(newPath)
      return { pdfUrl: pdfSlow }
    } catch (error) {
      throw error
    }
  },
  component: ViewPdf,
})

async function getPdfSlow(path: string) {
  const base64 = await window.api.getPdfFile(path)
  return new Promise<string>((resolve) => {
    resolve(`data:application/pdf;base64,${base64}`)
  })
}

function ViewPdf(): JSX.Element {
  const { pdfUrl } = Route.useLoaderData();
  
  const [windowSize, setWindowSize] = useState<{width: number, height: number}>({
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

  return (
    <div
      className="w-full max-h-screen flex flex-col place-items-center"
    >

      <nav
        className="sticky bg-gray-200 shadow shadow-gray-300 w-full"
      >
        <Link
          to="/"
          className="text-black ml-1"
          title="Go Back"
        >
          <i className="fa fa-arrow-left-long text-2xl p-1 my-1 border-solid border-4 border-black rounded-md shadow-sm shadow-black hover:border-blue-700 " />
        </Link>
      </nav>

      <div className="w-full pl-2 pr-4 max-h-screen overflow-y-auto bg-gray-400">
        <Await promise={pdfUrl} fallback="loading...">
          {(data) => {
            return (
              <iframe
                src={`${data}#toolbar=0&view=FitH`}
                className="p-2 w-full"
                style={{ height: `${Math.floor(windowSize.height*0.95)}px` }}
              // style={{ width: "100%", height: "100%" }}
              ></iframe>
            )
          }}
        </Await>
      </div>

    </div>
  )
}
