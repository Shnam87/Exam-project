import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import { addArticle, generateSlug, getArticle } from "~/utils/article.server";
import { requireInLoggedUser } from "~/utils/user.server";

export async function action({ request }: ActionArgs) {
  const user = await requireInLoggedUser(request);
  const authorId = user.id;

  const articleData = await request.formData();
  const title = articleData.get("title");
  const content = articleData.get("content");

  /*
  if (typeof title !== "string" || title.length < 2) {
    return json(
      {
        errors: {
          slug: null,
          title: "Title is required and must be at least 2 characters long",
          content: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof content !== "string" || content.length < 10) {
    return json(
      {
        errors: {
          slug: null,
          title: null,
          content:
            "content is required and must be at least 10 characters long",
        },
      },
      { status: 400 }
    );
  }
  */

  const errors = {
    title: title ? null : "Title is required",
    content: content ? null : "content is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof content === "string", "content must be a string");

  const slug = await generateSlug(title);

  /*
  const articleTitleExists = await getArticle(slug);
  if (articleTitleExists) {
    Window.prototype.alert("An article with the same title already exists");
  }
  */

  const article = await addArticle({ slug, title, content, authorId });
  return redirect(`/articles/${article.slug}`);

  //await addArticle({ slug, title, content, authorId });
  //return redirect("/articles");
}

export default function NewArticle() {
  const errors = useActionData<typeof action>();
  const transition = useTransition();
  const isAdding = Boolean(transition.submission);

  return (
    <div>
      <p className="pl-8 mb-2 text-base font-bold md:text-lg lg:text-xl text-sky-900">
        Add a new article
      </p>
      <Form method="post">
        <div>
          <label>
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
            <input
              type="text"
              name="title"
              className="w-11/12 p-2 mt-4 mb-2 ml-8 text-sm border-2 border-sky-800 rounded-xl lg:text-lg"
              placeholder="Title"
            />
          </label>

          {/*  <label className="flex flex-col w-full gap-1">
          Title:
          <input
            name="title"
            className="flex-1 px-3 text-lg leading-loose border-2 rounded-md border-sky-500"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )} */}
        </div>

        <div>
          <label htmlFor="content">
            {errors?.content ? (
              <em className="text-red-600">{errors.content}</em>
            ) : null}
          </label>
          <br />
          <textarea
            id="content"
            rows={20}
            name="content"
            className="w-11/12 p-2 ml-8 text-sm border-2 shadow-md resize-none border-sky-800 rounded-2xl lg:text-lg"
            placeholder="Content"
          />

          {/*   <label className="flex flex-col w-full gap-1">
          Content:
          <textarea
            name="Content"
            rows={8}
            className="flex-1 w-full px-3 py-2 text-lg leading-6 border-2 rounded-md border-sky-500"
            aria-invalid={actionData?.errors?.content ? true : undefined}
            aria-errormessage={
              actionData?.errors?.content ? "content-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.content && (
          <div className="pt-1 text-red-700" id="content-error">
            {actionData.errors.content}
          </div>
        )} */}
        </div>

        <div className="mt-4 mr-12 text-right">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-sky-700 rounded-xl hover:bg-sky-900 focus:bg-sky-400 disabled:bg-sky-300"
            disabled={isAdding}
          >
            {isAdding ? "Adding ... " : "Add a article"}
          </button>

          {/*  <button
          type="submit"
          className="px-4 py-2 text-white rounded bg-sky-500 hover:bg-sky-600 focus:bg-sky-400"
        >
          Save
        </button> */}
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="m-4 font-bold text-center text-red-600 ">
      <div className="text-2xl">
        An article with the same title already exists
      </div>
      <div className="text-3xl font-extrabold">Try again</div>
    </div>
  );
}
