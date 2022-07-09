const { PrismaClient } = require("@prisma/client");
const products = require("./products.json");

const prisma = new PrismaClient();

async function seed() {
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    for (let product of products) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          thumbnail: product.thumbnail,
        },
      });
    }
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
