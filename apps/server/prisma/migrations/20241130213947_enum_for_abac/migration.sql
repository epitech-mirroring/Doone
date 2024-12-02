/*
  Warnings:

  - You are about to drop the column `resource` on the `Rule` table. All the data in the column will be lost.
  - Added the required column `resourceId` to the `Rule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `Rule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `effect` on the `Rule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "Effect" AS ENUM ('ALLOW', 'DENY');

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "resource",
ADD COLUMN     "resourceId" TEXT NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "Action" NOT NULL,
DROP COLUMN "effect",
ADD COLUMN     "effect" "Effect" NOT NULL;
