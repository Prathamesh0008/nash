import PageShell from "@/components/PageShell";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search | Valentina's",
};

export default function SearchPage() {
  return (
    <PageShell>
      <SearchClient />
    </PageShell>
  );
}
