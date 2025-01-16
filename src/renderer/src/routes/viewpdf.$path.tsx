import { createFileRoute, Await, Link } from "@tanstack/react-router";
// import ViewPdf from "@renderer/components/ViewPdf";

export const Route = createFileRoute("/viewpdf/$path")({
  loader: async ({ params }) => {
    try {
      const pdfSlow = getPdfSlow(params.path);
      return { pdfUrl: pdfSlow };
    } catch (error) {
      throw error;
    }
  },
  component: ViewPdf,
});

function ViewPdf(): JSX.Element {
  const { pdfUrl } = Route.useLoaderData();

  return (
    <div className="w-full h-screen">
      <Link to="/" className="absolute top-0 left-0 ml-8 mt-4 ">
        Back
      </Link>
      <Await promise={pdfUrl} fallback="loading...">
        {(data) => {
          return (
            <iframe
              src={data}
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          );
        }}
      </Await>
    </div>
  );
}

async function getPdfSlow(path: string) {
  const base64 = await window.api.getPdfFile(path);
  return new Promise<string>((resolve) => {
    resolve(`data:application/pdf;base64,${base64}`);
  });
}
