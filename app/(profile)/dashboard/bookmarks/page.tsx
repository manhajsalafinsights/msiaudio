import { redirect } from "next/navigation";

export default function DashboardBookmarksRedirect() {
  redirect("/user/dashboard/bookmarks");
}
