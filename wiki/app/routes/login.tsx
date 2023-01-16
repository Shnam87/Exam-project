import {
  ActionArgs,
  json,
  LoaderArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import {
  createUserSession,
  getUsername,
  verifyLogin,
} from "~/utils/user.server";
import { validateEmail, validateRedirect } from "~/utils/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const username = await getUsername(request);
  if (username) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const loginData = await request.formData();
  //const username = loginData.get("username");
  const email = loginData.get("email");
  const password = loginData.get("password");
  const remember = loginData.get("remember");
  const redirectTo = validateRedirect(loginData.get("redirectTo"), "/");

  /*
  if (typeof username !== "string") {
    return json(
      {
        errors: {
          username: "Invalid username",
          email: null,
          password: null,
        },
      },
      { status: 400 }
    );
  }
*/

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: "Invalid email",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: "Invalid password",
        },
      },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      {
        errors: {
          email: null,
          password: "Invalid email or password",
        },
      },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    username: user.username,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => ({
  title: "Login",
});

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <div className="flex flex-col justify-center min-h-full">
      <div className="w-full max-w-md px-8 mx-auto">
        <Form method="post" className="space-y-6">
          {/*   <div>
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
          </div> */}

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
                name="email"
                type="email"
                required
                autoFocus={true}
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
                autoComplete="current-password"
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

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="block ml-2 text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/register",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
