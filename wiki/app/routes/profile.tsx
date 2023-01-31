import { json, LoaderArgs } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getUser, requireUser } from "~/utils/user.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.username, `username is required`);

  //console.log(params);

  //const username = await requireUsername(request);
  const username = await requireUser(params.username);

  const user = await getUser(request);
  if (!username /*|| username!== user.username*/ || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ user });
};

export default function UserDashboard() {
  const { user } = useLoaderData();
  //const { user } = useLoaderData<typeof loader>;

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col w-full h-full mt-8 border-r shadow-xl justify-evenly bg-gray-50 sm:flex-row">
        <div className="flex flex-col px-4 pt-4 border-r shadow-xl lg:px-8 bg-gray-50 sm:w-3/12">
          <div className="flex items-center justify-center">
            <img
              src={`https://ui-avatars.com/api/?format=svg&uppercase=true&size=128&rounded=true&name=${user.username}`}
              alt="User Avatar"
            />
          </div>
          <ol>
            <li key={user.username}>
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 m-4 text-xl text-white ${
                    isActive ? " bg-sky-900 " : " bg-sky-700 "
                  }`
                }
                to={user.username}
              >
                🏡 Profile
              </NavLink>
            </li>

            <li key="settings">
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 m-4 text-xl text-white ${
                    isActive ? " bg-sky-900 " : " bg-sky-700 "
                  }`
                }
                to="settings"
              >
                ⚙ Settings
              </NavLink>
            </li>
          </ol>
        </div>

        <div className="w-full sm:w-6/12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

//  Dealing with expected errors
export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="m-4 font-bold text-center text-red-600">
        <p className="m-4 text-3xl">Unauthorized</p>
        <p className="m-4 text-2xl">
          You must be logged in to access the profile page .
        </p>
        <Link
          to="/login?redirectTo=/profile"
          className="m-4 text-3xl font-extrabold text-sky-900"
        >
          Login
        </Link>
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

//  Dealing with unexpected errors
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="m-4 text-2xl font-bold text-center text-red-600">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
