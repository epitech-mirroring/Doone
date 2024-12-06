/*
  Warnings:

  - A unique constraint covering the columns `[action,resourceType,effect,policyId]` on the table `Rule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rule_action_resourceType_effect_policyId_key" ON "Rule"("action", "resourceType", "effect", "policyId");
