import { createFileRoute, Await, Link } from '@tanstack/react-router'
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

  return (
    <div className="w-full h-screen">
      <div
        className="px-2 py-1 absolute top-[10%] left-0 bg-white rounded-sm"
      >
        <Link
          to="/"
          className="text-black"
          title="Go Back"
        >
          <i className="fas fa-square-caret-left text-2xl" />
        </Link>
      </div>
      <Await promise={pdfUrl} fallback="loading...">
        {(data) => {
          return (
            <iframe
              src={data}
              className="w-full h-screen"
            // style={{ width: "100%", height: "100%" }}
            ></iframe>
          )
        }}
      </Await>
    </div>
  )
}
