import { redirect } from "next/navigation";

export default function HistoryRedirect() {
  redirect("/user/dashboard/history");
}
