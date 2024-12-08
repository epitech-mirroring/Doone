-- DropForeignKey
ALTER TABLE "OrganizationUsers" DROP CONSTRAINT "OrganizationUsers_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUsers" DROP CONSTRAINT "OrganizationUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TeamUsers" DROP CONSTRAINT "TeamUsers_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamUsers" DROP CONSTRAINT "TeamUsers_userId_fkey";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUsers" ADD CONSTRAINT "TeamUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUsers" ADD CONSTRAINT "TeamUsers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUsers" ADD CONSTRAINT "OrganizationUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUsers" ADD CONSTRAINT "OrganizationUsers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
