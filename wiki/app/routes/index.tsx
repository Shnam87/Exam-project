import { json, LoaderArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { Header } from "~/components/header";
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
    <div className="flex flex-col w-full h-full min-h-screen">
      <header className="flex items-center justify-between bg-[#0B3954] p-4 mb-8 text-white">
        <div>
          <p className="text-xl font-bold ">
            {" "}
            <Link to="/"> Shahrams Wiki </Link>{" "}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="mr-4">Hej ...</p>
          <p className="mx-8 ">
            {" "}
            <Link to="new"> lägg till en ny artikel </Link>{" "}
          </p>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-[#0B3954] border-none  hover:bg-blue-900"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center w-full h-full m-4 text-4xl font-bold text-red-700">
        Welcome to my Remix app
      </div>
      <ol>
        {info.articleList.map((article) => (
          <li key={article.slug}>
            <Link
              to={article.slug}
              prefetch="intent"
              className="text-blue-600 underline"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
