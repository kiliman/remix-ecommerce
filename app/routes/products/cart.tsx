import { TrashIcon } from "@heroicons/react/outline";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/solid";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { CartItem, Product } from "~/models/cart.server";
import {
  addToCart,
  getShoppingCart,
  removeFromCart,
} from "~/models/cart.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  cart: Awaited<ReturnType<typeof getShoppingCart>>;
};
export const loader: LoaderFunction = async ({ request }) => {
  const requiredUserId = await requireUserId(request);
  const cart = await getShoppingCart(requiredUserId);
  return json({ cart });
};

export const action: ActionFunction = async ({ request }) => {
  const requiredUserId = await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");
  switch (action) {
    case "increaseQuantity":
    case "decreaseQuantity": {
      const productId = formData.get("productId");
      const quantity = action === "increaseQuantity" ? 1 : -1;
      await addToCart(requiredUserId, String(productId), quantity);
      break;
    }
    case "removeFromCart": {
      const productId = formData.get("productId");
      await removeFromCart(requiredUserId, String(productId));
      break;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
  return json({ success: true });
};

export default function () {
  const { cart } = useLoaderData<LoaderData>();
  const totalItemCount =
    cart?.cartItems.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const grandTotal =
    cart?.cartItems.reduce(
      (acc: number, item: CartItem) => acc + Number(item.totalPrice),
      0
    ) ?? 0;

  return (
    <>
      <h1 className="text-2xl font-bold">My Shopping Cart</h1>
      <div className="flex flex-col">
        <div className="mt-4 flex flex-col gap-4">
          {cart?.cartItems.map((cartItem) => (
            <CartItemRow key={cartItem.id} cartItem={cartItem} />
          ))}
          <GrandTotalRow
            totalItemCount={totalItemCount}
            grandTotal={grandTotal}
          />
        </div>
      </div>
    </>
  );
}

function CartItemRow({
  cartItem,
}: {
  cartItem: CartItem & { product: Product };
}) {
  const fetcher = useFetcher();
  const product = cartItem.product;
  return (
    <div className="flex max-h-32 items-start gap-4">
      <img
        className="max-w-32 max-h-32 w-32 basis-32"
        src={product.thumbnail!}
        alt=""
      />
      <div className="basis-64">
        <p className="text-xl font-bold">{product.name}</p>
        <p className="text-gray-600">{product.description}</p>
      </div>
      <div className="flex basis-24 flex-col items-center gap-1 text-xl text-gray-900">
        <div className="flex gap-1">
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={product.id} />
            <button
              name="action"
              value="decreaseQuantity"
              className="pt-1 text-gray-400  disabled:text-gray-200"
              disabled={cartItem.quantity === 0}
            >
              <MinusCircleIcon className="h-5 w-5" />
            </button>
          </fetcher.Form>
          {cartItem.quantity}
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={product.id} />
            <button name="action" value="increaseQuantity" className="pt-1">
              <PlusCircleIcon className="h-5 w-5 text-gray-400" />
            </button>
          </fetcher.Form>
        </div>
        <div className="mt-2">
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={product.id} />
            <button
              className="inline-flex items-center"
              name="action"
              value="removeFromCart"
            >
              <TrashIcon className="h-6 w-6 text-gray-400" />{" "}
              <span className="text-sm text-gray-500">Remove</span>
            </button>
          </fetcher.Form>
        </div>
      </div>
      <p className="basis-32 text-right text-xl text-gray-900">
        ${product.price} each
      </p>
      <p className="basis-24 text-right text-xl font-bold text-gray-900">
        ${cartItem.totalPrice}
      </p>
    </div>
  );
}
function GrandTotalRow({
  totalItemCount,
  grandTotal,
}: {
  totalItemCount: number;
  grandTotal: number;
}) {
  return (
    <div className="flex max-h-32 items-start gap-4">
      <div className="basis-32"></div>
      <div className="basis-64"></div>
      <p className="basis-24 text-right text-2xl font-bold text-gray-800">
        {totalItemCount} item{totalItemCount === 1 ? "" : "s"}
      </p>
      <p className="basis-32 text-right text-2xl font-bold text-gray-800">
        Total:
      </p>
      <p className="basis-24 text-right text-2xl font-bold text-gray-800">
        ${grandTotal}
      </p>
    </div>
  );
}
