import { prisma } from "~/db.server";

export type { Product } from "@prisma/client";

export async function getAllProducts() {
  return prisma.product.findMany();
}

export async function getProduct(productId: string) {
  return prisma.product.findUnique({ where: { id: productId } });
}
