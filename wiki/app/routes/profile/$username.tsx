import { prisma } from "~/utils/dbConnection.server";
import { json, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getNumberOfArticle } from "~/utils/article.server";
import { getUser } from "~/utils/user.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user) {
    throw new Response(" Unauthorized ", { status: 401 });
  }

  //const userArticles = await getUserArticles();
  const count = await getNumberOfArticle(user.id);
  const userProfile = await prisma.user
    .findUnique({ where: { id: user.id } })
    .articles();

  return json({ count, userProfile, user });
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

export default function UserProfile() {
  const { user, count, userProfile } = useLoaderData<typeof loader>();

  //const info = useLoaderData<typeof loader>;
  //console.log(count);
  //console.log(userProfile);

  return (
    <div className="">
      <div className="flex flex-col 2xl:flex-row ">
        <div className="w-full p-4 m-4 bg-white border-4 border-red-700 rounded-lg shadow-xl 2xl:w-2/4">
          <h4 className="text-xl font-bold text-gray-900">Personal Info</h4>
          <ul className="mt-2 text-gray-700">
            <li className="flex py-2 border-y">
              <span className="w-40 font-bold ">Username:</span>
              <span className="text-gray-700">{user.username}</span>
            </li>
            <li className="flex py-2 border-b">
              <span className="w-40 font-bold ">Member of group:</span>
              <span className="text-gray-700">{user.role}</span>
            </li>

            <li className="flex py-2 border-b">
              <span className="w-40 font-bold ">Registered on:</span>
              <span className="text-gray-700">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </li>
            <li className="flex py-2 border-b">
              <span className="w-40 font-bold ">Last updated info:</span>
              <span className="text-gray-700">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </li>
            <li className="flex py-2 border-b">
              <span className="w-40 font-bold ">Email:</span>
              <span className="text-gray-700">{user.email}</span>
            </li>
            <li className="flex py-2 border-b">
              <span className="w-40 font-bold ">Number of contributions:</span>
              <span className="text-gray-700"> {count} </span>
            </li>
          </ul>
        </div>
        <div className="w-full p-4 m-4 bg-white border-4 border-green-700 rounded-lg shadow-xl 2xl:w-2/4">
          <h4 className="text-xl font-bold text-gray-900">
            Your contributions:
          </h4>
          <div className="mt-2 text-gray-700">
            {userProfile?.length === 0 ? (
              <p className="p-4">No contributions yet</p>
            ) : (
              <div className="list-decimal list-inside border-4 border-blue-700">
                {userProfile?.map((article) => (
                  <div>
                    <p className="mt-4" key={article.slug}>
                      <Link
                        to={`/articles/${article.slug}`}
                        prefetch="intent"
                        className="text-lg"
                      >
                        {" "}
                        {article.title}
                      </Link>
                    </p>
                    <p className="my-2 text-sm ">
                      Publicerad: {new Date(article.createdAt).toLocaleString()}
                      ;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
