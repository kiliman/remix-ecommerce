import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { addToCart } from "~/models/cart.server";
import type { Product } from "~/models/product.server";
import { getAllProducts } from "~/models/product.server";
import { getUserId } from "~/session.server";

type LoaderData = {
  products: Product[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const products = await getAllProducts();
  return json({ products });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");
  switch (action) {
    case "addToCart": {
      const productId = formData.get("productId");
      await addToCart(userId, String(productId));
      break;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
  return json({ success: true });
};

export default function () {
  const { products } = useLoaderData<LoaderData>();
  return (
    <div className="flex flex-wrap gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const fetcher = useFetcher();

  return (
    <div className="flex max-w-xs flex-col border">
      <img
        className="h-48 max-h-48 object-contain"
        src={product.thumbnail!}
        alt=""
      />
      <div className="flex grow flex-col justify-end gap-2">
        <h2 className="overflow-clip text-ellipsis whitespace-nowrap px-2 text-xl font-bold">
          {product.name}
        </h2>
        <p className="h-24 max-h-24 overflow-clip text-ellipsis px-2 text-gray-600">
          {product.description}
        </p>
        <div className="flex items-baseline justify-between border-t bg-gray-100 p-4">
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={product.id} />
            <button
              className="rounded-full bg-blue-500 px-4 py-2 text-white"
              name="action"
              value="addToCart"
            >
              Add to cart
            </button>
          </fetcher.Form>
          <p className="text-xl font-bold text-gray-800">${product.price}</p>
        </div>
      </div>
    </div>
  );
}
