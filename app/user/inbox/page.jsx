import { redirect } from "next/navigation";

export default function LegacyRoutePage() {
  redirect("/chat");
}
