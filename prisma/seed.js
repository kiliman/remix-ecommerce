const { PrismaClient } = require("@prisma/client");
const products = require("./products.json");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  if (userCount === 0) {
    // create default user
    await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
  }
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
