/*
  Warnings:

  - You are about to drop the column `name` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the `UserPolicy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPolicy" DROP CONSTRAINT "UserPolicy_policyId_fkey";

-- DropForeignKey
ALTER TABLE "UserPolicy" DROP CONSTRAINT "UserPolicy_userId_fkey";

-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "name";

-- DropTable
DROP TABLE "UserPolicy";

-- CreateTable
CREATE TABLE "_UserPolicy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserPolicy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserPolicy_B_index" ON "_UserPolicy"("B");

-- AddForeignKey
ALTER TABLE "_UserPolicy" ADD CONSTRAINT "_UserPolicy_A_fkey" FOREIGN KEY ("A") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPolicy" ADD CONSTRAINT "_UserPolicy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
