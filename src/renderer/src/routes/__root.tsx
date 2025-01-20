import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "../components/App";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        {/* <h1 className="text-black">Welcome!</h1>
        <Link to="/">Index</Link>{" | "}
        <Link to="/skata">Skata</Link>{" | "}
        <Link to="/view/$path" params={{ path: "C:\\Users\\atattos\\CustomDocs\\react file manager\\backend\\pdfs\\pdf3.pdf" }}>ViewPDF</Link> */}
        <App />
        {/* <Outlet /> */}
        {import.meta.env["VITE_SHOW_DEV_TOOLS"] === "TRUE" ? (
          <TanStackRouterDevtools />
        ) : null}
      </>
    );
  },
});

// C:\\Users\\atattos\\CustomDocs\\react file manager\\backend\\pdfs\\pdf3.pdf
// file:///C:/Users/atattos/CustomDocs/pdf-manager-qs/dist/win-unpacked/resources/app.asar/out/renderer/index.html%23view/C%3A%5CUsers%5Catattos%5CCustomDocs%5Creact%20file%20manager%5Cbackend%5Cpdfs%5Cpdf2%20-%20Copy%20(11).pdf
// file:///C:/Users/atattos/CustomDocs/pdf-manager-qs/dist/win-unpacked/resources/app.asar/out/renderer/index.html/view/C%3A%5CUsers%5Catattos%5CCustomDocs%5Creact%20file%20manager%5Cbackend%5Cpdfs%5Cpdf2%20-%20Copy%20(10).pdf
// file:///C:/Users/atattos/CustomDocs/pdf-manager-qs/dist/win-unpacked/resources/app.asar/out/renderer/index.html/skata
