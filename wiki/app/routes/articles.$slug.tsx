import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import invariant from "tiny-invariant";
import { getArticle } from "~/utils/article.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.slug, `params.slug is required`);

  const article = await getArticle(params.slug);

  //invariant(params.slug, `parameter "slug" is required`);

  if (!article) {
    throw new Response("Not Found", { status: 404 });
  }

  const content = marked(article.content);

  return json({ article, content });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: "Article Not Found",
    };
  }
  return {
    title: `${data.article.title}`,
  };
};

export default function ArticleSlug() {
  const { article, content } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto mt-8 prose md:prose-base lg:prose-xl">
      <h1 className="text-sky-900">{article.title}</h1>
      <span className="">
        Publicerad: {new Date(article.createdAt).toLocaleString()}
      </span>
      <span className="ml-4 ">By: {article.author.username}</span>
      <br />
      <span className="">
        Senast uppdaterad: {new Date(article.updatedAt).toLocaleString()};
      </span>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
