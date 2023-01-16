import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { validateEmail, validateRedirect } from "~/utils/utils";
import {
  createUserSession,
  getUserByEmail,
  getUserByUsername,
  getUsername,
  registerUser,
} from "~/utils/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const username = await getUsername(request);
  if (username) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const registerData = await request.formData();
  const username = registerData.get("username");
  const email = registerData.get("email");
  const password = registerData.get("password");
  const confirmPassword = registerData.get("confirmPassword");
  const redirectTo = validateRedirect(registerData.get("redirectTo"), "/");

  if (typeof username !== "string" || username.length < 4) {
    return json(
      {
        errors: {
          username: "Username must be at least 4 characters long",
          email: null,
          password: null,
          confirmPassword: null,
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
          password: null,
          confirmPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return json(
      {
        errors: {
          username: null,
          email: null,
          password: "Password must be at least 8 characters long",
          confirmPassword: null,
        },
      },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json({
      errors: {
        username: null,
        email: null,
        password: null,
        confirmPassword: "The passwords do not match. Try again.",
      },
    });
  }

  const existingUsername = await getUserByUsername(username);
  const existingUserEmail = await getUserByEmail(email);

  if (existingUsername) {
    return json(
      {
        errors: {
          username: " A user already exist with that username",
          email: null,
          password: null,
          confirmPassword: null,
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
          email: " A user already exist with that email address",
          password: null,
          confirmPassword: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await registerUser({ username, email, password });

  return createUserSession({
    request,
    username: user.username,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col justify-center min-h-full">
      <div className="w-full max-w-md px-8 mx-auto">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                minLength={4}
                required
                autoFocus={true}
                name="username"
                type="text"
                aria-invalid={actionData?.errors?.username ? true : undefined}
                aria-describedby="username-error"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
              {actionData?.errors?.username && (
                <div className="pt-1 text-red-700" id="username-error">
                  {actionData.errors.username}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                required
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                minLength={8}
                required
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                minLength={8}
                required
                name="confirmPassword"
                type="password"
                aria-invalid={
                  actionData?.errors?.confirmPassword ? true : undefined
                }
                aria-describedby="confirmPassword-error"
                className="w-full px-2 py-1 text-lg border border-gray-500 rounded"
              />
              {actionData?.errors?.confirmPassword && (
                <div className="pt-1 text-red-700" id="confirmPassword-error">
                  {actionData.errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="newsletter"
              name="newsletter"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="newsletter"
              className="block ml-2 text-sm text-gray-900"
            >
              Subscribe to newsletter
            </label>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
