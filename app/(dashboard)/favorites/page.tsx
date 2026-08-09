import { redirect } from "next/navigation";

export default function FavoritesRedirect() {
  redirect("/user/dashboard/favorites");
}
