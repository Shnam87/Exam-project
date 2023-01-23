import { json, LoaderArgs, redirect } from "@remix-run/node";
import { getUser, requireInLoggedUser } from "~/utils/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  //const user = await getUser(request);
  const user = await requireInLoggedUser(request);
  if (!user) {
    return redirect("/articles");
  }
  return redirect(`${user.username}`);
};
