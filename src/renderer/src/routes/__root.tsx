import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet />
        {import.meta.env["VITE_SHOW_DEV_TOOLS"] === "TRUE" ? (
          <TanStackRouterDevtools />
        ) : null}
      </>
    );
  },
});
