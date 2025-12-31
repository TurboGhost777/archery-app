/*
  Warnings:

  - A unique constraint covering the columns `[endId,arrowNumber]` on the table `Arrow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionId,endNumber]` on the table `End` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Arrow_endId_arrowNumber_key" ON "Arrow"("endId", "arrowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "End_sessionId_endNumber_key" ON "End"("sessionId", "endNumber");
