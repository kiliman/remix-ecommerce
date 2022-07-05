import { prisma } from "~/db.server";
import { getProduct } from "./product.server";

export type { Cart, CartItem, Product } from "@prisma/client";

export async function getShoppingCart(userId: string) {
  return prisma.cart.findFirst({
    where: { id: userId },
    include: {
      cartItems: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getCartItemsCount(userId: string) {
  const cart = await getShoppingCart(userId);
  if (!cart) {
    return 0;
  }
  return cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
}

export async function addShoppingCart(userId: string) {
  return prisma.cart.create({
    data: {
      id: userId,
    },
  });
}
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
) {
  let [cart, product] = await Promise.all([
    getShoppingCart(userId),
    getProduct(productId),
  ]);
  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }
  if (!cart) {
    const newCart = await addShoppingCart(userId);
    cart = { ...newCart, cartItems: [] };
  }
  // If the product is already in the cart, just update the quantity
  const cartItem = cart.cartItems.find((item) => item.productId === productId);
  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    const newTotalPrice = Number(product.price) * newQuantity;
    return prisma.cartItem.update({
      data: { quantity: newQuantity, totalPrice: newTotalPrice },
      where: { id: cartItem.id },
    });
  }
  // Otherwise, add the product to the cart
  return prisma.cartItem.create({
    data: {
      cart: { connect: { id: cart.id } },
      product: { connect: { id: product.id } },
      quantity,
      price: product.price,
      totalPrice: Number(product.price) * quantity,
    },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getShoppingCart(userId);

  return prisma.cartItem.deleteMany({
    where: {
      cartId: cart!.id,
      productId,
    },
  });
}
