import { redirect } from "next/navigation";

export default function DashboardNotesRedirect() {
  redirect("/user/dashboard/notes");
}
