import { json, LoaderArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
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
