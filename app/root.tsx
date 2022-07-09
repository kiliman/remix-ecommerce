import type { User } from "@prisma/client";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { commitSession, getSession, getUser } from "./session.server";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix E-Commerce",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const session = await getSession(request);
  session.set("userId", user?.id);
  return json<LoaderData>(
    { user },
    { headers: { "set-cookie": await commitSession(session) } }
  );
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
