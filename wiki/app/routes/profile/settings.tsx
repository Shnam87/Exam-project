import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  deleteUser,
  getUserByEmail,
  getUserByUsername,
  logout,
  requireInLoggedUser,
} from "~/utils/user.server";
import invariant from "tiny-invariant";
import { validateEmail } from "~/utils/utils";
import { prisma } from "~/utils/dbConnection.server";
import bcrypt from "bcryptjs";
import type { User } from "~/utils/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user: User = await requireInLoggedUser(request);
  invariant(user.username, `username is required`);

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const user: User = await requireInLoggedUser(request);
  invariant(user.username, `username is required`);
  //invariant(params.username, `username is required`);

  const settingData = await request.formData();
  const intent = settingData.get("intent");

  const username = settingData.get("username");
  const email = settingData.get("email");
  const newPassword = settingData.get("newPassword");
  const confirmPassword = settingData.get("confirmPassword");
  const currentPassword = settingData.get("currentPassword");
  const newsletter =
    settingData.has("newsletter") && settingData.get("newsletter") === "on"
      ? true
      : false;

  if (typeof username !== "string" || username.length < 4) {
    return json(
      {
        errors: {
          username: "Username must be at least 4 characters long",
          email: null,
          newPassword: null,
          confirmPassword: null,
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          username: null,
          email: "Invalid email",
          newPassword: null,
          confirmPassword: null,
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return json(
      {
        errors: {
          username: null,
          email: null,
          newPassword: "Password must be at least 8 characters long",
          confirmPassword: null,
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof confirmPassword !== "string" || confirmPassword !== newPassword) {
    return json(
      {
        errors: {
          username: null,
          email: null,
          newPassword: null,
          confirmPassword: "The passwords do not match. Try again.",
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (
    typeof currentPassword !== "string" ||
    !(await bcrypt.compare(currentPassword, user.passwordHash))
  ) {
    return json(
      {
        errors: {
          username: null,
          email: null,
          newPassword: null,
          confirmPassword: null,
          currentPassword: "Invalid password",
        },
      },
      { status: 400 }
    );
  }

  const existingUsername = await getUserByUsername(username);
  const existingUserEmail = await getUserByEmail(email);

  if (existingUsername) {
    return json(
      {
        errors: {
          username: "Can't save that username since it's already taken.",
          email: null,
          newPassword: null,
          confirmPassword: null,
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (existingUserEmail) {
    return json(
      {
        errors: {
          username: null,
          email: "Can't save that email since it's already taken.",
          newPassword: null,
          confirmPassword: null,
          currentPassword: null,
        },
      },
      { status: 400 }
    );
  }

  //const id = user.id;
  const validPassword = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  const newPasswordHash = await bcrypt.hash(confirmPassword, 10);

  if (intent === "delete") {
    //await deleteUser(username);
    await prisma.user.delete({ where: { id: user.id } });
  } else if (intent === "update" && validPassword) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username || undefined,
        email: email || undefined,
        passwordHash: newPasswordHash || undefined,
        newsletter: newsletter || undefined,
      },
    });
  }
  return logout(request);
};

export const meta: MetaFunction = () => {
  return {
    title: "Setting",
  };
};

export default function UserSettings() {
  const { user } = useLoaderData<typeof loader>();
  const errorData = useActionData<typeof action>();

  const transition = useTransition();
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  return (
    <div className="">
      <h2 className="m-2 text-xl font-bold text-center">
        Note: Changes made here will trigger an automatic logout.
      </h2>
      <Form method="post">
        <div>
          <div className="mt-1">
            <label>
              Username
              <input
                name="username"
                required
                type="text"
                // defaultValue={user.username}
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
                aria-invalid={errorData?.errors?.username ? true : undefined}
                aria-errormessage={
                  errorData?.errors?.username ? "username-error" : undefined
                }
              />
            </label>
            {errorData?.errors.username && (
              <div className="pt-1 text-red-700" id="username-error">
                {" "}
                {errorData.errors.username}{" "}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Email address
              <input
                //defaultValue={user.email}
                name="email"
                type="email"
                required
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
                aria-invalid={errorData?.errors?.email ? true : undefined}
                aria-errormessage={
                  errorData?.errors?.email ? "email-error" : undefined
                }
              />
            </label>
            {errorData?.errors.email && (
              <div className="pt-1 text-red-700" id="email-error">
                {" "}
                {errorData.errors.email}{" "}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              New Password
              <input
                minLength={8}
                name="newPassword"
                type="password"
                required
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
                aria-invalid={errorData?.errors?.newPassword ? true : undefined}
                aria-errormessage={
                  errorData?.errors?.newPassword
                    ? "newPassword-error"
                    : undefined
                }
              />
            </label>
            {errorData?.errors.newPassword && (
              <div className="pt-1 text-red-700" id="newPassword-error">
                {" "}
                {errorData.errors.newPassword}{" "}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Confirm new password
              <input
                minLength={8}
                name="confirmPassword"
                type="password"
                //required
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
                aria-invalid={
                  errorData?.errors?.confirmPassword ? true : undefined
                }
                aria-errormessage={
                  errorData?.errors?.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
              />
            </label>
            {errorData?.errors.confirmPassword && (
              <div className="pt-1 text-red-700" id="confirmPassword-error">
                {" "}
                {errorData.errors.confirmPassword}{" "}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mt-1">
            <label>
              Current Password
              <input
                minLength={8}
                required
                name="currentPassword"
                type="password"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
                aria-invalid={
                  errorData?.errors?.currentPassword ? true : undefined
                }
                aria-errormessage={
                  errorData?.errors?.currentPassword
                    ? "currentPassword-error"
                    : undefined
                }
              />
            </label>
            {errorData?.errors.currentPassword && (
              <div className="pt-1 text-red-700" id="currentPassword-error">
                {" "}
                {errorData.errors.currentPassword}{" "}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="newsletter"
            name="newsletter"
            type="checkbox"
            defaultChecked={user.newsletter}
            className="w-6 h-6 mx-4 mt-4 rounded text-sky-600 border-sky-300 focus:ring-sky-500 accent-sky-600"
          />
          <label
            htmlFor="newsletter"
            className="block mt-4 text-base font-semibold text-gray-900"
          >
            Subscribe to newsletter
          </label>
        </div>

        <div className="flex justify-end gap-4 ">
          <button
            type="submit"
            name="intent"
            value="delete"
            className="px-5 py-3 m-4 text-white bg-red-500 rounded hover:bg-red-700 focus:bg-red-400 disabled:bg-red-300"
            disabled //={isDeleting}
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
