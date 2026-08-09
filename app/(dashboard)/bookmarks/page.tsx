import { redirect } from "next/navigation";

export default function BookmarksRedirect() {
  redirect("/user/dashboard/bookmarks");
}
