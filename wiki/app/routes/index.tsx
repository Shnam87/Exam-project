/* import { MetaFunction } from "@remix-run/node";

export default function IndexRoute() {}

export const meta: MetaFunction = () => ({
  title: "Shahram Wiki - Articles",
  refresh: {
    httpEquiv: "refresh",
    content: "0;url=http://localhost:3000/articles",
  },
});
 */
/**************************************************** */
// <meta http-equiv="refresh" content="3;url=https://www.mozilla.org" />

import { redirect } from "@remix-run/node";

export const loader = async () => redirect("/articles");
