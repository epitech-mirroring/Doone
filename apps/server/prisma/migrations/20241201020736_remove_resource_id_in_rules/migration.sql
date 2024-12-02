/*
  Warnings:

  - You are about to drop the column `resourceId` on the `Rule` table. All the data in the column will be lost.
  - Added the required column `resourceType` to the `Rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "resourceId",
ADD COLUMN     "resourceType" TEXT NOT NULL;
