-- CreateTable
CREATE TABLE "Sharing_Link" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sharing_Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sharing_Doc" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sharing_Doc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sharing_Link_code_key" ON "Sharing_Link"("code");

-- CreateIndex
CREATE INDEX "Sharing_Link_createdAt_idx" ON "Sharing_Link"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sharing_Doc_code_key" ON "Sharing_Doc"("code");

-- CreateIndex
CREATE INDEX "Sharing_Doc_createdAt_idx" ON "Sharing_Doc"("createdAt");
