import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="p-2 flex gap-2">
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
        <Outlet />
        {import.meta.env["VITE_SHOW_DEV_TOOLS"] === "TRUE" ? (
          <TanStackRouterDevtools />
        ) : null}
      </>
    );
  },
});
