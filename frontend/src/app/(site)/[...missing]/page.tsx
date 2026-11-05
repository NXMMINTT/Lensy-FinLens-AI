import { notFound } from "next/navigation";

/** Unknown URLs get the FinLens 404 inside the site layout. */
export default function MissingPage() {
  notFound();
}
