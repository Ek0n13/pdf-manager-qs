import { Await } from "@tanstack/react-router";
import { Route } from "../routes/viewpdf.$path";

function ViewPdf() {
  // const xxx =
  //   "D:\\Random\\pdf-files\\folder-555555555555555555555555555555555555555555555555555555555555555555555555555555555555555" +
  //   "\\Carousel Drums.pdf";

  console.log("hello");
  const { pdfUrl } = Route.useLoaderData();

  // useEffect(() => {
  //   return () => {
  //     if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  //   };
  // }, [pdfUrl]);

  // console.log(pdfUrl);

  return (
    <Await promise={pdfUrl} fallback="loading...">
      {(data) => {
        return (
          <iframe
            src={data}
            style={{ width: "100%", height: "100vh" }}
          ></iframe>
        );
      }}
    </Await>
  );
}

export default ViewPdf;
