import { ActionArgs, redirect } from "@remix-run/node";
import { logout } from "~/utils/user.server";

export const action = async ({ request }: ActionArgs) => {
  return logout(request);
};

export const loader = async () => {
  return redirect("/");
};
