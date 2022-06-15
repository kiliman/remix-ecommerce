import { ShoppingCartIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { getCartItemsCount } from "~/models/cart.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
type LoaderData = {
  cartItemsCount: number;
};
export const loader: LoaderFunction = async ({ request }) => {
  const requiredUserId = await requireUserId(request);
  const cartItemsCount = await getCartItemsCount(requiredUserId);
  return json({ cartItemsCount });
};

export default function Products() {
  const { cartItemsCount } = useLoaderData<LoaderData>();
  const user = useUser();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Products</Link>
        </h1>
        <p>{user.email}</p>
        <div className="flex items-center gap-4">
          <Link to="cart" className="flex items-end text-white">
            <ShoppingCartIcon className="text-whte h-8 w-8" />
            {cartItemsCount > 0 && (
              <div className="-ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-white">
                {cartItemsCount}
              </div>
            )}
          </Link>

          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>

      <main className="h-full bg-white p-6">
        <Outlet />
      </main>
    </div>
  );
}
