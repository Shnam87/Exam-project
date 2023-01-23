import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { logout, requireInLoggedUser } from "~/utils/user.server";
import invariant from "tiny-invariant";
import { validateEmail } from "~/utils/utils";
import { prisma } from "~/utils/dbConnection.server";
import bcrypt from "bcryptjs";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireInLoggedUser(request);

  //const user = await requireUser(params.username);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  invariant(user.username, `username is required`);
  console.log(user.username);

  /*
  const userB = await requireInLoggedUser(request);
  if (!userB) {
    throw new Response("Unauthorized", { status: 401 });
  }
*/

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireInLoggedUser(request);
  invariant(user.username, `username is required`);

  const settingData = await request.formData();
  const intent = settingData.get("intent");

  const username = settingData.get("username");
  const email = settingData.get("email");
  const newPassword = settingData.get("newPassword");
  const confirmPassword = settingData.get("confirmPassword");
  const currentPassword = settingData.get("currentPassword");

  const errors = {
    username: username ? null : "username is required",
    email: email ? null : "email is required",
    newPassword: newPassword ? null : "New password is required",
    confirmPassword: confirmPassword ? null : "Confirm password is required",
    currentPassword: currentPassword ? null : "Current password is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(
    typeof username === "string" && username.length < 4,
    "Can't save that username. Try something else"
  );
  invariant(validateEmail(email), "Invalid email");
  invariant(
    typeof newPassword === "string" && newPassword.length < 8,
    "Password must be at least 8 characters long"
  );
  invariant(
    typeof confirmPassword === "string" && confirmPassword === newPassword,
    "The passwords do not match. Try again."
  );
  invariant(
    typeof currentPassword === "string" &&
      (await bcrypt.compare(currentPassword, user.passwordHash)),
    "Invalid Password"
  );

  const id = user.id;
  const validPassword = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  const newPasswordHash = await bcrypt.hash(confirmPassword, 10);

  if (intent === "delete") {
    await prisma.user.delete({ where: { id } });
  } else if (intent === "update" && validPassword) {
    await prisma.user.update({
      where: { id },
      data: {
        username: username || undefined,
        email: email || undefined,
        passwordHash: newPasswordHash || undefined,
      },
    });
  }
  return logout(request);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: "User not found",
    };
  }
  return {
    title: `${data.user.username} Profile`,
  };
};

export default function UserSettings() {
  const { user } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const transition = useTransition();
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  return (
    <div className="">
      <h2 className="m-2 text-xl font-bold text-center">
        Note: Changes made here will trigger an automatic logout.
      </h2>
      <Form method="post" key={user.username}>
        <div>
          <div className="mt-1">
            <label>
              Username
              {errors?.username ? (
                <em className="text-xs text-red-600">{errors.username}</em>
              ) : null}
              <input
                name="username"
                type="text"
                defaultValue={user.username}
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Email address
              {errors?.email ? (
                <em className="text-xs text-red-600">{errors.email}</em>
              ) : null}
              <input
                defaultValue={user.email}
                name="email"
                type="email"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              New Password
              {errors?.newPassword ? (
                <em className="text-xs text-red-600">{errors.newPassword}</em>
              ) : null}
              <input
                minLength={8}
                name="newPassword"
                type="password"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Confirm new password
              {errors?.confirmPassword ? (
                <em className="text-xs text-red-600">
                  {errors.confirmPassword}
                </em>
              ) : null}
              <input
                minLength={8}
                name="confirmPassword"
                type="password"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Current Password
              {errors?.currentPassword ? (
                <em className="text-xs text-red-600">
                  {errors.currentPassword}
                </em>
              ) : null}
              <input
                minLength={8}
                name="currentPassword"
                type="password"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 ">
          <button
            type="submit"
            name="intent"
            value="delete"
            className="px-5 py-3 m-4 text-white bg-red-500 rounded hover:bg-red-700 focus:bg-red-400 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete account"}
          </button>

          <button
            type="submit"
            name="intent"
            value="update"
            className="px-5 py-3 m-4 text-white rounded bg-sky-500 hover:bg-sky-700 focus:bg-sky-400 disabled:bg-sky-300"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update profile"}
          </button>
        </div>
      </Form>
    </div>
  );
}
