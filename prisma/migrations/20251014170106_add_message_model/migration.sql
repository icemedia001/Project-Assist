-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "discoverySessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "phase" TEXT,
    "technique" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_discoverySessionId_createdAt_idx" ON "messages"("discoverySessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "discovery_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
