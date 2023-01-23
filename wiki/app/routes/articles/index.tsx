import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
//import { prisma } from "~/utils/db.sever";
import { prisma } from "~/utils/dbConnection.server";

export const loader = async () => {
  const count = await prisma.article.count();
  const randomNumber = Math.floor(Math.random() * count);

  const featuredArticles = await prisma.article.findMany({
    take: 2,
    skip: randomNumber,
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
  });

  /*
  if (!featuredArticle) {
    throw new Response(" There is no featured article", { status: 404 });
  }
  */

  return json({ featuredArticles });
};

export default function ArticlesIndexRoute() {
  const { featuredArticles } = useLoaderData<typeof loader>();
  //const content = marked(featuredArticle.content);

  const date = new Intl.DateTimeFormat("sv", {
    dateStyle: "full",
    timeStyle: "long",
  });

  return (
    <div>
      {featuredArticles?.length === 0 ? (
        <p className="p-4">There is no featured article yet</p>
      ) : (
        <div>
          {featuredArticles?.map((featuredArticle) => (
            <div className="mb-4 border-4 border-green-600">
              <h1 className="my-6 text-3xl text-center border-b-2">
                {featuredArticle.title}
              </h1>
              <p className="my-2 text-sm ">
                Publicerad: {date.format(new Date(featuredArticle.createdAt))}
              </p>
              <p className="my-2 text-sm ">
                By: {featuredArticle.author.username}
              </p>
              <p className="my-2 text-sm ">
                Senast uppdaterad:{" "}
                {date.format(new Date(featuredArticle.updatedAt))}
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(featuredArticle.content),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
