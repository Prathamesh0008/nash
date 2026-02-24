import { redirect } from "next/navigation";

export default function LegacyRoutePage() {
  redirect("/auth/login");
}
