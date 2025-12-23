import PageShell from "@/components/PageShell";
import { Video } from "lucide-react";

export const metadata = {
  title: "Exclusive Videos | Valentina's",
};

export default function VideosPage() {
  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Video className="w-10 h-10 text-pink-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          Exclusive Videos
        </h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Curated private previews and exclusive content from our premium companions.
          Coming soon.
        </p>
      </section>
    </PageShell>
  );
}
