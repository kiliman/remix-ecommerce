/*
  Warnings:

  - You are about to drop the column `userId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `cartId` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Cart" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Cart";
DROP TABLE "Cart";
ALTER TABLE "new_Cart" RENAME TO "Cart";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
