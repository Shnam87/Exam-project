import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  //title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

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
          <p className="mr-4">Hi ...</p>
          <p className="mx-8 ">
            {" "}
            <Link to="new"> Add a new article </Link>{" "}
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
      <main> {children} </main>
      <footer className="m-5 font-semibold text-center ">
        {" "}
        Copyright &copy; {new Date().getFullYear()}{" "}
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
