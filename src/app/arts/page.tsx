import { getAllArts } from "@/lib/arts";
import ArtsClient from "./ArtsClient";

export default function ArtsPage() {
  const arts = getAllArts();
  return <ArtsClient arts={arts} />;
}
