import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { prisma } from "~/utils/db.sever";

export const loader = async () => {
  const count = await prisma.article.count();
  const randomNumber = Math.floor(Math.random() * count);

  const [featuredArticle] = await prisma.article.findMany({
    take: 1,
    skip: randomNumber,
  });

  if (!featuredArticle) {
    throw new Response(" There is no featured article", { status: 404 });
  }

  return json({ featuredArticle });
};

export default function ArticlesIndexRoute() {
  const info = useLoaderData<typeof loader>();
  const content = marked(info.featuredArticle.markdown);

  const date = new Intl.DateTimeFormat("sv", {
    dateStyle: "full",
    timeStyle: "long",
  });

  return (
    <div>
      <p></p>
      <h1 className="my-6 text-3xl text-center border-b-2">
        {info.featuredArticle.title}
      </h1>
      <p className="my-2 text-sm ">
        Publicerad: {date.format(new Date(info.featuredArticle.createdAt))}
      </p>
      <p className="my-2 text-sm ">
        Senast uppdaterad:{" "}
        {date.format(new Date(info.featuredArticle.updatedAt))}
      </p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
