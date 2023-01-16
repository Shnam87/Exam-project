import { json, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import styles from "./styles/app.css";
import { getUser } from "./utils/user.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  //title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request) });
};

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title ? title : "Remix Wiki App"}</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useLoaderData();
  return (
    <div className="flex flex-col w-full h-full min-h-screen">
      <header className="flex items-center justify-between bg-[#0B3954] p-4 mb-8 text-white">
        <div>
          <p className="text-xl font-bold ">
            {" "}
            <Link to="/"> Shahrams Wiki </Link>{" "}
          </p>
        </div>
        {user ? (
          <div className="flex items-center justify-between">
            <p className="mr-8">
              <Link to={`/${user.username}`}> Hi {user.username} </Link>
            </p>
            <p className="mx-8 ">
              <Link to="new"> Add a new article </Link>
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
        ) : (
          <p className="mx-8 ">
            <Link to="/login">Login to add a new article </Link>
          </p>
        )}
      </header>
      <main className="min-h-[960px]"> {children} </main>
      <footer className="mt-5 p-2 bg-[#eeeeee] flex items-center justify-center">
        <img
          className="w-8 "
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/PD-icon.svg/128px-PD-icon.svg.png"
          alt="CC public domain mark"
        />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}
