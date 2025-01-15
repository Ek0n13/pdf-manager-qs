import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: About,
});

function About(): JSX.Element {
  return <div className="p-2">Hello from Index!</div>;
}
