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

export default function IndexRoute() {
  const info = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        {info.articleList.length === 0 ? (
          <p> inga artikel ännu </p>
        ) : (
          <ol>
            {info.articleList.map((article) => (
              <li key={article.slug}>
                <Link
                  to={article.slug}
                  prefetch="intent"
                  className="text-lg text-blue-600 underline"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
