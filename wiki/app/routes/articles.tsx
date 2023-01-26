import { json, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getArticles } from "~/utils/article.server";
//import { prisma } from "~/utils/db.sever";
import { prisma } from "~/utils/dbConnection.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const allArticles = await getArticles();
  const articleList = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, updatedAt: true },
  });
  //const user = await getUser(request);
  //console.log(params);

  return json({ allArticles });
};

export const meta: MetaFunction = () => {
  return {
    title: "Start page",
  };
};

export default function Articles() {
  const { allArticles } = useLoaderData<typeof loader>();

  return (
    <div className="flex mt-8 justify-evenly">
      <div className="flex w-1/4 ">
        {allArticles.length === 0 ? (
          <p> inga artikel ännu </p>
        ) : (
          <ol className="flex flex-col w-full px-3 list-decimal list-inside xl:px-6">
            {allArticles.map((article) => (
              <li className="mt-4" key={article.slug}>
                <button>
                  <img
                    className="w-4 mr-1"
                    src="/icons/thumb_up.svg"
                    alt="Like mark"
                  />
                </button>

                <Link to={article.slug} prefetch="intent" className="text-lg">
                  {article.title} {/*  By { article.author} */}
                </Link>

                <p>
                  {" "}
                  <span className="pr-4 ">{article.likesCount} like</span>{" "}
                  <span> By: {article.author.username} </span>{" "}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="w-2/4 max-w-screen-xl ">
        <Outlet />
      </div>
    </div>
  );
}
