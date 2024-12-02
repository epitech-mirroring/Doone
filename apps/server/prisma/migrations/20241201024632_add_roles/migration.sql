/*
  Warnings:

  - You are about to drop the `_OrganizationUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeamUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "_OrganizationUsers" DROP CONSTRAINT "_OrganizationUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationUsers" DROP CONSTRAINT "_OrganizationUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_TeamUsers" DROP CONSTRAINT "_TeamUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeamUsers" DROP CONSTRAINT "_TeamUsers_B_fkey";

-- DropTable
DROP TABLE "_OrganizationUsers";

-- DropTable
DROP TABLE "_TeamUsers";

-- CreateTable
CREATE TABLE "TeamUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "TeamUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationUsers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamUsers" ADD CONSTRAINT "TeamUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUsers" ADD CONSTRAINT "TeamUsers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUsers" ADD CONSTRAINT "OrganizationUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUsers" ADD CONSTRAINT "OrganizationUsers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
