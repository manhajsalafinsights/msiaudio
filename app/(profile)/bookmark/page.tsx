import { redirect } from "next/navigation";

export default function BookmarkRedirect() {
  redirect("/user/dashboard/bookmarks");
}
