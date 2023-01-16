import { json, LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/db.sever";

export const loader = async ({ request }: LoaderArgs) => {
  const articleList = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, updatedAt: true },
  });
  //const user = await getUser(request);

  return json({
    articleList,
    //user,
  });
};

export default function Articles() {
  const info = useLoaderData<typeof loader>();

  return (
    <div className="flex justify-around mt-8 border-4 border-black">
      <div>
        {info.articleList.length === 0 ? (
          <p> inga artikel ännu </p>
        ) : (
          <ol className="list-decimal list-inside border-4 border-blue-700">
            {info.articleList.map((article) => (
              <li className="mt-4" key={article.slug}>
                <Link to={article.slug} prefetch="intent" className="text-lg">
                  {article.title}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="w-2/4 max-w-screen-xl border-4 border-red-700">
        <Outlet />
      </div>
    </div>
  );
}
