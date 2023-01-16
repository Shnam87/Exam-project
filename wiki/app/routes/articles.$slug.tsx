import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import invariant from "tiny-invariant";
import { getArticle } from "~/utils/article.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.slug, `parameter "slug" is required`);

  const article = await getArticle(params.slug);
  invariant(article, `article with slug ${params.slug} does not exist`);

  const content = marked(article.markdown);

  return json({ article, content });
};

export default function ArticleSlug() {
  const { article, content } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-4xl mx-auto">
      <h1 className="my-6 text-3xl text-center border-b-2">{article.title}</h1>
      <p className="my-2 text-sm ">
        Publicerad: {new Date(article.createdAt).toLocaleString()}
      </p>
      <p className="my-2 text-sm ">
        Senast uppdaterad: {new Date(article.updatedAt).toLocaleString()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
