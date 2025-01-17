import { createFileRoute, Await, Link } from "@tanstack/react-router";
// import ViewPdf from "@renderer/components/ViewPdf";

export const Route = createFileRoute("/$path")({
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

async function getPdfSlow(path: string) {
  const base64 = await window.api.getPdfFile(path);
  return new Promise<string>((resolve) => {
    resolve(`data:application/pdf;base64,${base64}`);
  });
}

function ViewPdf(): JSX.Element {
  const { pdfUrl } = Route.useLoaderData();

  return (
    <div className="w-full h-screen">
      <Link
        to="/"
        replace
        className="absolute top- left-0 px-2 bg-white rounded-sm text-black "
      >
        <i className="fas fa-square-caret-left text-2xl py-1" />
      </Link>
      <Await promise={pdfUrl} fallback="loading...">
        {(data) => {
          return (
            <iframe
              src={data}
              className="pl-6 w-full h-screen"
              // style={{ width: "100%", height: "100%" }}
            ></iframe>
          );
        }}
      </Await>
    </div>
  );
}
