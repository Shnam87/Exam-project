import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
//import { prisma } from "~/utils/db.sever";
import { prisma } from "~/utils/dbConnection.server";

export const loader = async () => {
  const count = await prisma.article.count();
  const randomNumber = Math.floor(Math.random() * count);

  const featuredArticles = await prisma.article.findMany({
    take: 3,
    //skip: randomNumber,
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
  });

  return json({ featuredArticles });
};

export default function ArticlesIndexRoute() {
  const { featuredArticles } = useLoaderData<typeof loader>();

  return (
    <div>
      {featuredArticles?.length === 0 ? (
        <p className="p-4 text-lg font-bold text-sky-900">
          There is no featured article yet
        </p>
      ) : (
        <div>
          <p className="px-2 my-2 text-base font-bold lg:text-xl md:text-lg text-sky-900">
            Featured articles:
          </p>
          {featuredArticles?.map((featuredArticle) => (
            <div className="px-2 mt-2 border-2" key={featuredArticle.slug}>
              <h2 className="text-lg font-bold text-sky-900 lg:text-xl">
                {featuredArticle.title}
              </h2>
              <span className="pr-4 text-xs ">
                Publicerad: {new Date(featuredArticle.createdAt).toDateString()}
              </span>
              <span className="text-xs">
                By: {featuredArticle.author.username}
              </span>
              {/* <p className="my-2 text-sm ">
                Senast uppdaterad:{" "}
                {date.format(new Date(featuredArticle.updatedAt))}
              </p> */}
              <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: marked(featuredArticle.content),
                }}
              />
              <span>
                {" "}
                <Link
                  to={featuredArticle.slug}
                  prefetch="intent"
                  className="p-2"
                >
                  {" "}
                  Read more{" "}
                </Link>{" "}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
