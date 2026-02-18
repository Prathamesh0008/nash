import { redirect } from "next/navigation";

export default async function LegacyPage({ params }) {
  const { id } = await params;
  redirect(`/workers/${id}`);
}
