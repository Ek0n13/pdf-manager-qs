import { createFileRoute } from "@tanstack/react-router";
import App from "../components/App";
import z from "zod";

const validateSearch = z.object({
  pdfName: z.string().catch("").nullish(),
  folderName: z.string().catch("").nullish(),
});

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: (search) => validateSearch.parse(search),
});
