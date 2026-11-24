ALTER TABLE "whatsapp_config"
ADD COLUMN "connectionStatus" TEXT NOT NULL DEFAULT 'DISCONNECTED',
ADD COLUMN "connectedPhone" TEXT,
ADD COLUMN "qr" TEXT,
ADD COLUMN "lastError" TEXT,
ADD COLUMN "workerId" TEXT,
ADD COLUMN "workerLeaseExpiresAt" TIMESTAMP(3);

CREATE TABLE "whatsapp_auth_keys" (
    "sessionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_auth_keys_pkey" PRIMARY KEY ("sessionId", "key")
);

CREATE TABLE "whatsapp_commands" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_commands_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whatsapp_commands_status_createdAt_idx"
ON "whatsapp_commands"("status", "createdAt");
