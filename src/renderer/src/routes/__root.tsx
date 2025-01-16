import { createRootRoute /*, Link, Outlet */ } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import App from "../components/App";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <App />
        {/* <div className="p-2 flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{" "}
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>{" "}
          <Link to="/skata" className="[&.active]:font-bold">
            Skata
          </Link>
        </div>
        <hr />
        <Outlet /> */}
        {import.meta.env["VITE_SHOW_DEV_TOOLS"] === "TRUE" ? (
          <TanStackRouterDevtools />
        ) : null}
      </>
    );
  },
});
