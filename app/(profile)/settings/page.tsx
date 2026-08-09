import { redirect } from "next/navigation";

export default function SettingsRedirect() {
  redirect("/user/dashboard/settings");
}
